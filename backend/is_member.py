import os 

def is_member_cctv(year,month,day):
    root_path="/workspaces/Largeinteractivecalendar/data/CCTV_Schedule"
    file_path=f'{year}년 {month}월 {day}일 CCTV근무.json'

    full_path=os.path.join(root_path,file_path)

    return os.path.exists(full_path)

def is_first(year,month):
    root_path1="/workspaces/Largeinteractivecalendar/data/OnDuty_Schedule"
    file_path1=f'{year}년 {month}월 당직근무표.json'

    root_path2="/workspaces/Largeinteractivecalendar/data/Cafe_Schedule"
    file_path2=f'{year}년 {month}월 식당청소근무표.json'


    full_path1=os.path.join(root_path1,file_path1)
    full_path2=os.path.join(root_path2,file_path2)

    return os.path.exists(full_path1) and os.path.exists(full_path2)




