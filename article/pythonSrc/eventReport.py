import os
import asyncio
from aiohttp import ClientSession
import shutil
import base64

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
            base64_to_file(response_data, file_path)
    except Exception as e:
        print(e)

# Function to save base64 strings as files
def base64_to_file(base64_list, output_path):
    if not os.path.exists(os.path.dirname(output_path)):
        os.makedirs(os.path.dirname(output_path), exist_ok=True)

    image_id = 1
    for item in base64_list:
        if item['type'] == 'base64':
            image_data = item['string']
            with open(f"{output_path}{image_id}.png", "wb") as file:
                file.write(base64.b64decode(image_data))
                image_id += 1
                print(f"{output_path}{image_id}.png saved successfully!")


# Main function
async def main(event_id_string):
    event_id = int(event_id_string)
    output_dir = f"{project_root}/output/eventReport/{event_id}"

    async with ClientSession() as session:
        # Process various requests
        await process_request(session, '/eventReport/eventReportTitle', {'eventId': event_id}, f"{output_dir}/0_eventReportTitle_")
        await process_request(session, '/eventReport/eventReportCutoffListOfEvent', {'eventId': event_id, 'server': 3}, f"{output_dir}/2_ycxAll_")
        await process_request(session, '/eventReport/eventReportPlayerNumber', {'eventId': event_id, 'server': 3}, f"{output_dir}/3_eventReportPlayerNumber_")
        await process_request(session, '/ycx', {'eventId': event_id, 'tier': 10, 'server': 3}, f"{output_dir}/5_eventReportCutoffDetailTop_")
        # Process tier list
        for tier in tier_list_of_server_cn:
            await process_request(session, '/eventReport/eventReportCutoffDetail', {'eventId': event_id, 'tier': tier, 'server': 3}, f"{output_dir}/6_eventReportCutoffDetail{tier}_")

# Run the script
if __name__ == "__main__":
    event_id = input("请输入活动ID：")
    asyncio.run(main(event_id))
