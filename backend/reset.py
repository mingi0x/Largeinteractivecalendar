import json
import os
import calendar
from datetime import datetime, timedelta

def reset_onduty_schedule(year, month):
    last_day=calendar.monthrange(year, month)[1]#해당 월의 마지막 날짜 가져오기
    
    dates = [f"{year}-{month:02d}-{day:02d}" for day in range(1, last_day + 1)]#해당 월의 모든 날짜 생성

    with open("/workspaces/Largeinteractivecalendar/data/onduty_member.json", "r", encoding="utf-8") as f:
        onduty_members = json.load(f)

    with open("/workspaces/Largeinteractivecalendar/data/exclusion_member.json", "r", encoding="utf-8") as f:
        exclusion_members = json.load(f)

    file_path=f'/workspaces/Largeinteractivecalendar/data/OnDuty_Schedule/{year}년 {month}월 당직근무표.json'

    with open(file_path, "r", encoding="utf-8") as f:
        onduty_schedule = json.load(f)
    
    for date in dates:
        reset_member=next((member['이름'] for member in onduty_schedule if member['날짜'] == date), None)#근무표에 있는 이름 가져오

        for member in onduty_members:
            if member["이름"] == reset_member:
                member["당직점수"] -= 1#근무표에 있는 이름의 점수 초기화
                break

        next_date = datetime.strptime(date, "%Y-%m-%d") + timedelta(days=1)#다음 날짜 계산
        next_date_str = next_date.strftime("%Y-%m-%d")#다음 날짜 문자열로 변환

        exclusion_members[date]['excluded'].remove(reset_member)#오늘 날짜의 열외자 명단에서 근무표에 있는 이름 제거
        exclusion_members[next_date_str]['excluded'].remove(reset_member)#다음 날짜의 열외자 명단에서 근무표에 있는 이름 제거

    os.remove(file_path)#근무표 파일 삭제
    
    with open("/workspaces/Largeinteractivecalendar/data/onduty_member.json", "w", encoding="utf-8") as f:
        json.dump(onduty_members, f, ensure_ascii=False, indent=4)

    with open("/workspaces/Largeinteractivecalendar/data/exclusion_member.json", "w", encoding="utf-8") as f:
        json.dump(exclusion_members, f, ensure_ascii=False, indent=4)

def reset_cafe_schedule(year, month):
    last_day=calendar.monthrange(year, month)[1]#해당 월의 마지막 날짜 가져오기
    
    dates = [f"{year}-{month:02d}-{day:02d}" for day in range(1, last_day + 1)]#해당 월의 모든 날짜 생성

    with open("/workspaces/Largeinteractivecalendar/data/all_member_data.json", "r", encoding="utf-8") as f:
        members = json.load(f)

    with open("/workspaces/Largeinteractivecalendar/data/exclusion_member.json", "r", encoding="utf-8") as f:
        exclusion_members = json.load(f)

    file_path=f'/workspaces/Largeinteractivecalendar/data/Cafe_Schedule/{year}년 {month}월 식당청소근무표.json'

    with open(file_path, "r", encoding="utf-8") as f:
        cafe_schedule = json.load(f)
    
    for date in dates:
        reset_member=[member['이름'] for member in cafe_schedule if member['날짜'] == date]#근무표에 있는 이름 가져오기

        for member in members:
            if member["이름"] in reset_member:
                member["식당청소점수"] -= 1#근무표에 있는 이름의 점수 초기화

        exclusion_members[date]['excluded']=[name for name in exclusion_members[date]['excluded'] if name not in reset_member]#오늘 날짜의 열외자 명단에서 근무표에 있는 이름 제거
        
    os.remove(file_path)#근무표 파일 삭제
    
    with open("/workspaces/Largeinteractivecalendar/data/all_member_data.json", "w", encoding="utf-8") as f:
        json.dump(members, f, ensure_ascii=False, indent=4)

    with open("/workspaces/Largeinteractivecalendar/data/exclusion_member.json", "w", encoding="utf-8") as f:
        json.dump(exclusion_members, f, ensure_ascii=False, indent=4)

def reset_cctv_schedule(year, month, day):
    date=f"{year}-{month:02d}-{day:02d}"#오늘 날짜 문자열 생성

    with open("/workspaces/Largeinteractivecalendar/data/all_member_data.json", "r", encoding="utf-8") as f:
        members = json.load(f)

    with open("/workspaces/Largeinteractivecalendar/data/exclusion_member.json", "r", encoding="utf-8") as f:
        exclusion_members = json.load(f)

    file_path=f'/workspaces/Largeinteractivecalendar/data/CCTV_Schedule/{year}년 {month}월 {day}일 CCTV근무표.json'

    with open(file_path, "r", encoding="utf-8") as f:
        cctv_schedule = json.load(f)

    score=1.0 if exclusion_members.get(date, {}).get('type') == "평일" else 2.0#휴일이면 점수 1.0, 평일이면 점수 0.5

    reset_member=[entry['이름'] for entry in cctv_schedule]#근무표에 있는 이름 가져오기

    exclusion_members[date]['excluded']=[name for name in exclusion_members[date]['excluded'] if name not in reset_member]#오늘 날짜의 열외자 명단에서 근무표에 있는 이름 제거

    for member in members:
        if member["이름"] in reset_member:
            member["CCTV점수"] -= score#근무표에 있는 이름의 점수 초기화

    os.remove(file_path)#근무표 파일 삭제
    
    with open("/workspaces/Largeinteractivecalendar/data/all_member_data.json", "w", encoding="utf-8") as f:
        json.dump(members, f, ensure_ascii=False, indent=4)

    with open("/workspaces/Largeinteractivecalendar/data/exclusion_member.json", "w", encoding="utf-8") as f:
        json.dump(exclusion_members, f, ensure_ascii=False, indent=4)


# def reset_cafe_score():
#     with open("/workspaces/Largeinteractivecalendar/data/all_member_data.json", "r", encoding="utf-8") as f:
#         members = json.load(f)
    
#     for member in members:
#         member["식당청소점수"] = 0.0
    
#     with open("/workspaces/Largeinteractivecalendar/data/all_member_data.json", "w", encoding="utf-8") as f:
#         json.dump(members, f, ensure_ascii=False, indent=4)

#     file_path="/workspaces/Largeinteractivecalendar/data/Cafe_Schedule"
#     for filename in os.listdir(file_path):
#         os.remove(os.path.join(file_path, filename))

# def reset_cctv_score():
#     with open("/workspaces/Largeinteractivecalendar/data/all_member_data.json", "r", encoding="utf-8") as f:
#         members = json.load(f)
    
#     for member in members:
#         member["CCTV점수"] = 0.0
    
#     with open("/workspaces/Largeinteractivecalendar/data/all_member_data.json", "w", encoding="utf-8") as f:
#         json.dump(members, f, ensure_ascii=False, indent=4)

#     file_path="/workspaces/Largeinteractivecalendar/data/CCTV_Schedule"
#     for filename in os.listdir(file_path):
#         os.remove(os.path.join(file_path, filename))

# def reset_onduty_score():
#     with open("/workspaces/Largeinteractivecalendar/data/onduty_member.json", "r", encoding="utf-8") as f:
#         members = json.load(f)
    
#     for member in members:
#         member["당직점수"] = 0.0
    
#     with open("/workspaces/Largeinteractivecalendar/data/onduty_member.json", "w", encoding="utf-8") as f:
#         json.dump(members, f, ensure_ascii=False, indent=4)

#     file_path="/workspaces/Largeinteractivecalendar/data/OnDuty_Schedule"
#     for filename in os.listdir(file_path):
#         os.remove(os.path.join(file_path, filename))