import json

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