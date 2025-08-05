import json
import os
import time
from datetime import datetime
from typing import Optional,Tuple,Dict

import dateparser
import requests
from lxml import html

from extract_all_tags_info import get_all_tags_data


def convert_size_str_to_num(input_str):
    try:
        return int(float(input_str.strip().upper().replace(',', '').replace(' ', '')
                         .replace('PB', 'e15').replace('TB', 'e12').replace('GB', 'e9')
                         .replace('MB', 'e6').replace('KB', 'e3')
                         .replace('P', 'e15').replace('T', 'e12').replace('G', 'e9')
                         .replace('M', 'e6').replace('K', 'e3').replace('B', '')
                         .replace('BYTE', '').replace('BYTES', '')))
    except Exception as se:
        print("convert_size_str_to_num failed:", se, "the input string is", input_str)
        return 0


def get_models_info() ->  Optional[Tuple[Dict, Dict]] :
    url = "https://ollama.com/library"
    response = requests.get(url)
    if response.status_code != 200:
        print("get_models_info failed:", response.status_code)
        return None
    tree = html.fromstring(response.content)

    div_element = tree.xpath('/html/body/main/div/main/div[3]')[0]

    error_count = 0
    total_count = 0
    models = {}
    all_capabilities = set()
    all_parameters = set()
    for index, li in enumerate(div_element.xpath('.//li[@x-test-model]'), 1):
        try:
            model_info = {}

            title_element = li.xpath('.//h2//span[@class="group-hover:underline truncate"]')[0]
            model_name = title_element.text.strip()

            description_element = li.xpath('.//p[@class="max-w-lg break-words text-neutral-800 text-md"]')[0]
            model_info['description'] = description_element.text.strip()

            capabilities = []
            for cap in li.xpath('.//span[@x-test-capability]'):
                cap_text = cap.text.strip()
                capabilities.append(cap_text)
                all_capabilities.add(cap_text)
            model_info['capabilities'] = capabilities

            parameters = []
            for size in li.xpath('.//span[@x-test-size]'):
                size_text = size.text.strip()
                parameters.append(size_text)
                all_parameters.add(size_text)
            model_info['parameters'] = parameters

            pull_count_element = li.xpath('.//span[@x-test-pull-count]')[0]
            pull_count_str = pull_count_element.text.strip()
            model_info['pull_str'] = pull_count_str
            model_info['pull'] = convert_size_str_to_num(pull_count_str)

            tag_count_element = li.xpath('.//span[@x-test-tag-count]')[0]
            model_info['tag_count'] = tag_count_element.text.strip()

            updated_element = li.xpath('.//span[@x-test-updated]')[0]
            update_str = updated_element.text.strip()
            model_info['updated'] = update_str
            parsed_date = dateparser.parse(update_str)
            model_info['update_date'] = parsed_date.strftime('%Y-%m-%d') if parsed_date else None

            link_element = li.xpath('.//a')[0]
            link = link_element.get('href')
            if link.startswith('/'):
                model_info['link'] = f"https://ollama.com{link}"
            else:
                model_info['link'] = link

            model_info["popularity"] = index
            models[model_name] = model_info
            total_count += 1

        except Exception as e:
            error_count += 1
            print(f"Error processing model {index}: {e}")

    status = {
            "total_count": total_count,
            "success": True,
            "error": error_count,
            "data_updated": datetime.now().isoformat(),
            "cap_list": sorted(list(all_capabilities)),
            "pars_list": sorted(list(all_parameters)),
            "processing_time": f"{time.time() - start_time:.2f} seconds"
    }

    print(f"Total models: {total_count}, Errors: {error_count} time:{time.time() - start_time}")
    return models, status


def save_json(file_path: str, data) -> None:
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


if __name__ == '__main__':
    start_time = time.time()
    os.makedirs('data', exist_ok=True)
    os.makedirs('data/tags', exist_ok=True)

    models_data, status = get_models_info()
    if models_data:
        save_json('data/models.json',models_data)
        save_json('data/models_status.json', status )

        all_tags_data,tags_data_status = get_all_tags_data(list(models_data.keys()))

        save_json('data/tags.json', all_tags_data )
        save_json('data/tags_status.json',tags_data_status )

    print(f"Scraping completed in {time.time() - start_time:.2f} seconds")
