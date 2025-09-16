# Author: Amir Hossein derhami

import json
import os
import time
from datetime import datetime, timedelta
from typing import Dict, Optional, Tuple

import dateparser
import requests
from lxml import html


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
                    tag_info['size_num'] = convert_size_str_to_num(size_str.strip())
                if hash_:
                    data[hash_] = tag_info
            return data
        else:
            return None
    except Exception as e:
        print(f"error :{model_name} :e{e}")
        return None


from concurrent.futures import as_completed, ThreadPoolExecutor


def get_all_tags_data(models_data):
    start_time = time.time()
    all_tags_data = {}
    successful = 0
    failed = 0
    model_names = list(models_data.keys())
    with ThreadPoolExecutor(max_workers=10) as executor:
        future_to_model = {executor.submit(get_model_tags, model_name): model_name for model_name in model_names}
        for future in as_completed(future_to_model):
            model_name = future_to_model[future]
            try:
                data = future.result()
                if data is not None:
                    successful += len(data)
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
            "api_data_updated": datetime.now().date().isoformat(),
            "processing_time": f"{time.time() - start_time:.2f} seconds"
    }
    print(f"Total Tags: {len(all_tags_data)}  time:{time.time() - start_time}")

    return all_tags_data, tags_data_status


def get_models_info() -> Optional[Tuple[Dict, Dict]]:
    start_time = time.time()
    url = "https://ollama.com/library"
    response = requests.get(url)
    if response.status_code != 200:
        print("get_models_info failed:", response.status_code)
        return None
    tree = html.fromstring(response.content)

    div_element = tree.xpath('/html/body/div/main/div[3]')[0]

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
            "api_data_updated": datetime.now().date().isoformat(),
            "cap_list": sorted(list(all_capabilities)),
            "pars_list": sorted(list(all_parameters)),
            "processing_time": f"{time.time() - start_time:.2f} seconds"
    }

    print(f"Total models: {total_count}, Errors: {error_count} time:{time.time() - start_time}")
    return models, status


def save_json(file_path: str, data) -> None:
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def main():
    start_time = time.time()
    models_data, status = get_models_info()
    if models_data:
        prev_success = False
        prev_date = None
        prev_comp_date = None

        try:
            resp = requests.get('https://raw.githubusercontent.com/D3rhami/ollama_gallery/main/data/models_status.json',
                                timeout=15)
            if resp.status_code == 200:
                obj = resp.json()
                prev_success = obj.get("success")
                prev_date = obj.get("api_data_updated") or obj.get("data_updated")

            if prev_date:
                try:
                    prev_comp_date = (
                            datetime.strptime(prev_date, '%Y-%m-%d') - timedelta(days=1)).date().isoformat()
                except:
                    prev_comp_date = prev_date
        except:
            pass

        filtered_models = None
        if prev_comp_date and prev_success:
            filtered_models = {name: info for name, info in models_data.items() if
                               info.get('update_date') and info.get('update_date') >= prev_comp_date}
        print(f"! prev data was {prev_comp_date} and f:{len(filtered_models)} m:{len(models_data)}")
        all_tags_data, tags_data_status = get_all_tags_data(filtered_models or models_data)
        count_tags = {m: len(tags_info) for m, tags_info in all_tags_data.items()}
        models_data = {m: {**model_info, "tag_count": count_tags.get(m)} if count_tags.get(m, None) else model_info
                       for m, model_info in models_data.items()}

        save_json('data/models.json', models_data)
        save_json('data/models_status.json', status)
        for model_name, model_info in models_data.items():
            file_name = model_name + '.json'
            save_json(os.path.join('data', 'models', file_name), model_info)

        for model_name, tags in all_tags_data.items():
            save_json(os.path.join('data', 'tags', f"{model_name}.json"), tags)

        save_json('data/tags.json', all_tags_data)
        save_json('data/tags_status.json', tags_data_status)
    print(f"Scraping completed in {time.time() - start_time:.2f} seconds")


if __name__ == '__main__':
    os.makedirs('data', exist_ok=True)
    os.makedirs('data/tags', exist_ok=True)
    os.makedirs('data/models', exist_ok=True)

    main()
