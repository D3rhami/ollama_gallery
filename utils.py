
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
