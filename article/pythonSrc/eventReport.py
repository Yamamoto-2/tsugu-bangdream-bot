import os
import asyncio
from aiohttp import ClientSession
import shutil

# Constants
url = 'http://tsugubot.com:8080'
project_root = os.path.dirname(__file__)

# Tiers list for 'cn' server
tier_list_of_server_cn = [50, 100, 300, 500, 1000, 2000]

# Function to process each request
async def process_request(session, endpoint, data, file_path):
    try:
        async with session.post(url + endpoint, json=data) as response:
            response_data = await response.json()
            # Process the response data as required
            # Example: Save response to a file
            with open(file_path, 'w') as file:
                file.write(str(response_data))
    except Exception as e:
        print(e)

# Main function
async def main(event_id_string):
    event_id = int(event_id_string)
    output_dir = f"{project_root}/output/eventReport/{event_id}"

    async with ClientSession() as session:
        # Process various requests
        await process_request(session, '/eventReport/eventReportTitle', {'eventId': event_id}, f"{output_dir}/0_eventReportTitle_")
        # ... other process_request calls ...

        # Copy files
        shutil.copyfile(f"{project_root}/assets/title1.png", f"{output_dir}/1_title1.png")
        shutil.copyfile(f"{project_root}/assets/title2.png", f"{output_dir}/4_title2.png")

        # Process tier list
        for tier in tier_list_of_server_cn:
            await process_request(session, '/eventReport/eventReportCutoffDetail', {'eventId': event_id, 'tier': tier, 'server': 3}, f"{output_dir}/6_eventReportCutoffDetail{tier}_")

# Run the script
if __name__ == "__main__":
    event_id = input("请输入活动ID：")
    asyncio.run(main(event_id))
