import json
from datetime import datetime

def add_exclusion(year,month,day,name):
    date_str = f"{year}-{month:02d}-{day:02d}"  # 날짜 문자열 생성
    # 여기에 열외자 명단에 이름을 추가하는 로직을 구현하세요.
    # 예를 들어, JSON 파일에 이름을 추가하는 경우:
    with open("/workspaces/Largeinteractivecalendar/data/exclusion_member.json", "r", encoding="utf-8") as f:
        exclusion_members = json.load(f)

    day_name=datetime.strptime(date_str, "%Y-%m-%d").strftime("%A")#요일 이름 가져오기

    type="평일" if day_name in ["Monday", "Tuesday", "Wednesday", "Thursday"] else "휴일"#근무 날짜 유형 결정

    if date_str not in exclusion_members:
        exclusion_members[date_str] = {"type": type, "excluded": []}

    today_excluded = exclusion_members.get(date_str, {}).get('excluded', [])  # 오늘 열외자 명단 가져오기
    
    if name not in today_excluded:
        exclusion_members[date_str]['excluded'].extend([name])  # 오늘 날짜의 열외자 명단에 이름 추가
        print(f"✅ '{name}'이(가) 열외자 명단에 추가되었습니다.")
    else:
        print(f"⚠️ '{name}'은(는) 이미 열외자 명단에 존재합니다.")

    with open("/workspaces/Largeinteractivecalendar/data/exclusion_member.json", "w", encoding="utf-8") as f:
        json.dump(exclusion_members, f, ensure_ascii=False, indent=4)

def remove_exclusion(year,month,day,name):
    date = f"{year}-{month:02d}-{day:02d}"  # 날짜 문자열 생성

    # JSON 파일에서 열외자 명단을 읽어옵니다.
    with open("/workspaces/Largeinteractivecalendar/data/exclusion_member.json", "r", encoding="utf-8") as f:
        exclusion_members = json.load(f)

    today_excluded = exclusion_members.get(date, {}).get('excluded', [])  # 오늘 열외자 명단 가져오기

    # 해당 이름이 명단에 있는지 확인하고 제거합니다.
    if name in today_excluded:
        exclusion_members[date]['excluded'].remove(name)
        # 변경된 명단을 다시 JSON 파일에 저장합니다.
        with open("/workspaces/Largeinteractivecalendar/data/exclusion_member.json", "w", encoding="utf-8") as f:
            json.dump(exclusion_members, f, ensure_ascii=False, indent=4)
        print(f"🔥 삭제된 인원: {name}")
    else:
        print(f"⚠️ 삭제하려는 인원 '{name}'이(가) 명단에 없습니다.")

def return_exclusion(year, month, day):
    date = f"{year}-{month:02d}-{day:02d}"  # 날짜 문자열 생성

    with open("/workspaces/Largeinteractivecalendar/data/exclusion_member.json", "r", encoding="utf-8") as f:
        exclusion_members = json.load(f)

    return exclusion_members.get(date, {}).get('excluded', [])  # 오늘 열외자 명단 반환