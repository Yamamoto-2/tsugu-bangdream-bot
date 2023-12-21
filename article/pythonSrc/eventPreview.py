import os
import base64
import requests
import asyncio
from aiohttp import ClientSession
import sys

# Constants
url = 'http://tsugubot.com:8080'
project_root = os.path.dirname(__file__)

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
    output_dir = f"{project_root}/output/eventPreview/{event_id}"

    async with ClientSession() as session:
        tasks = [
            process_request(session, '/eventPreview/eventPreviewTitle', {'eventId': event_id}, f"{output_dir}/0_eventPreviewTitle_"),
            process_request(session, '/eventPreview/eventPreviewDetail', {'eventId': event_id}, f"{output_dir}/2_eventPreviewDetail_"),
            process_request(session, '/eventPreview/eventPreviewRules', {'eventId': event_id}, f"{output_dir}/3_eventPreviewRules_"),
            process_request(session, '/eventPreview/eventPreviewSongs', {'eventId': event_id}, f"{output_dir}/4_eventPreviewSongs_"),
            process_request(session, '/eventPreview/eventPreviewCards', {'eventId': event_id}, f"{output_dir}/5_eventPreviewCards_"),
            process_request(session, '/eventPreview/eventPreviewGacha', {'eventId': event_id}, f"{output_dir}/6_eventPreviewGacha_"),
            process_request(session, '/eventPreview/eventPreviewCards', {'eventId': event_id, 'illustration': True}, f"{output_dir}/7_eventPreviewCardIllustration_"),
        ]
        await asyncio.gather(*tasks)

# Run the script
if __name__ == "__main__":
    event_id = input("请输入活动ID：")
    asyncio.run(main(event_id))
