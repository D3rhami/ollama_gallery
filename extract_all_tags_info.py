import json
import time
from concurrent.futures import as_completed, ThreadPoolExecutor
from datetime import datetime
import json
import os
import time
from datetime import datetime
from typing import Optional,Tuple,Dict

import dateparser
import requests
from utils import convert_size_str_to_num


import requests
from lxml import html

session = requests.Session()
session.headers.update({
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
})


def get_model_tags(model_name):
    url = f"https://ollama.com/library/{model_name}/tags"

    try:
        response = session.get(url, timeout=10)
        response.raise_for_status()

        tree = html.fromstring(response.content)
        tag_elements = tree.xpath(
                "//div[contains(@class, 'group') and contains(@class, 'px-4') and contains(@class, 'py-3')]")

        if tag_elements:
            data = {}
            for element in tag_elements:
                hash_ = None
                font_mono_elements = element.xpath(".//span[contains(@class, 'font-mono')]")
                if font_mono_elements:
                    hash_ = [el.text_content().strip() for el in font_mono_elements][0]
                    if hash_ in data:
                        continue
                tag_info = {}
                href_elements = element.xpath(".//a[@href]")
                if href_elements:
                    link = href_elements[0].get('href')
                    if link.startswith('/'):
                        tag_info['href'] = f"https://ollama.com{link}"
                    else:
                        tag_info['href'] = link

                font_medium_elements = element.xpath(".//div[contains(@class, 'font-medium')]")
                if font_medium_elements:
                    tag_info['name'] = [el.text_content().strip() for el in font_medium_elements][0].replace("\n", "")

                neutral_500_elements = element.xpath(".//div[contains(@class, 'text-neutral-500')]")
                if neutral_500_elements:
                    _, input_types, updated_str = [el.text_content().strip() for el in neutral_500_elements][:3]
                    updated_str = str(updated_str).split("Â·")[-1].strip()
                    input_types = [str(t).strip() for t in input_types.split(",")]
                    tag_info['input_types'] = input_types
                    tag_info['updated_str'] = updated_str
                    parsed_date = dateparser.parse(updated_str)
                    tag_info['update_date'] = parsed_date.strftime('%Y-%m-%d') if parsed_date else None

                col_span_elements = element.xpath(".//p[contains(@class, 'col-span')]")
                if col_span_elements:
                    size_str, context_window = [el.text_content().strip() for el in col_span_elements][:2]
                    tag_info['context_window'] = context_window.strip()
                    tag_info['context_window_num'] = convert_size_str_to_num(context_window.strip())
                    tag_info['size_str'] = size_str.strip()
                    tag_info['size_num'] = convert_size_str_to_num( size_str.strip())

                if hash_:
                    data[hash_] = tag_info

            return data
        else:
            return None

    except Exception as e:
        print(f"error :{model_name} :e{e}")
        return None


def get_all_tags_data(model_names):
    start_time = time.time()
    all_tags_data = {}
    successful = 0
    failed = 0

    with ThreadPoolExecutor(max_workers=10) as executor:
        future_to_model = {executor.submit(get_model_tags, model_name): model_name for model_name in model_names}

        for future in as_completed(future_to_model):
            model_name = future_to_model[future]
            try:
                data = future.result()

                if data is not None:
                    successful += len(data)
                    with open(f'data/tags/{model_name}.json', 'w', encoding='utf-8') as f:
                        json.dump(data, f, indent=2, ensure_ascii=False)
                    all_tags_data[model_name] = data
                else:
                    failed += 1

            except Exception as e:
                failed += 1
                print(f"Exception for {model_name}: {e}")

    tags_data_status = {
            "successful": successful,
            "success": True,
            "failed": failed,
            "data_updated": datetime.now().isoformat(),
            "processing_time": f"{time.time() - start_time:.2f} seconds"
    }

    return all_tags_data, tags_data_status
