import json
import calendar
from datetime import datetime,timedelta

def get_onduty_members(year,month):
    onduty_schedule=[]#근무 스케줄표
    last_day = calendar.monthrange(year, month)[1]#해당 월의 마지막 날짜 계산
    dates = [f"{year}-{month:02d}-{day:02d}" for day in range(1, last_day + 1)]#해당 월의 모든 날짜 생성

    with open("/workspaces/Largeinteractivecalendar/data/onduty_member.json", "r", encoding="utf-8") as f:#당직 근무자 정보 로드
        onduty_members = json.load(f)

    with open("/workspaces/Largeinteractivecalendar/data/exclusion_member.json", "r", encoding="utf-8") as f:#열외자 정보 로드
            exclusion_members = json.load(f)

    for date in dates:#각 날짜에 대해 당직 근무자 선정

        next_date = datetime.strptime(date, "%Y-%m-%d") + timedelta(days=1)#다음 날짜 계산
        next_date_str = next_date.strftime("%Y-%m-%d")#다음 날짜 문자열로 변환
        
        candidates=sorted(onduty_members, key=lambda x: x["당직점수"])#당직 점수 기준으로 근무자 정렬
        seleceted_worker=None#선정된 근무자 초기화

        day_name=datetime.strptime(date, "%Y-%m-%d").strftime("%A")#요일 이름 가져오기

        type="평일" if day_name in ["Monday", "Tuesday", "Wednesday", "Thursday"] else "휴일"#근무 날짜 유형 결정
        
        if date not in exclusion_members:#열외자 명단에 오늘 날짜가 없으면 초기화
            exclusion_members[date]={"type": type, "excluded": []}

        today_excluded=exclusion_members.get(date, {}).get('excluded', [])#오늘 열외자 명단 가져오기

        for name in candidates:#열외자 명단에 없는 근무자 중에서 선정
            if name["이름"] not in today_excluded:
                seleceted_worker=name
                break

        if seleceted_worker:
            onduty_members[onduty_members.index(seleceted_worker)]["당직점수"]+=1#선정된 근무자의 당직 점수 증가

            if seleceted_worker["이름"] not in today_excluded:#오늘 날짜의 열외자 명단에 선정된 근무자가 없으면 추가
                exclusion_members[date]['excluded'].extend([seleceted_worker["이름"]])

            if next_date_str not in exclusion_members:#열외자 명단에 다음 날짜가 없으면 초기화
                next_day_name=datetime.strptime(next_date_str, "%Y-%m-%d").strftime("%A")#요일 이름 가져오기

                next_type="평일" if next_day_name in ["Monday", "Tuesday", "Wednesday", "Thursday"] else "휴일"#근무 날짜 유형 결정

                exclusion_members[next_date_str]={"type": next_type, "excluded": []}
            if seleceted_worker["이름"] not in exclusion_members.get(next_date_str, {}).get('excluded', []):#다음 날짜의 열외자 명단에 선정된 근무자가 없으면 추가
                exclusion_members[next_date_str]['excluded'].extend([seleceted_worker["이름"]])


            onduty_schedule.append({"날짜": date, "요일": day_name, "이름": seleceted_worker["이름"]})#근무 스케줄표에 오늘 날짜, 요일, 선정된 근무자 이름 추가
    
    sorted_exclusion=dict(sorted(exclusion_members.items(), key=lambda x:datetime.strptime(x[0], "%Y-%m-%d")))#정렬된 열외자 명단을 딕셔너리로 변환
    with open("/workspaces/Largeinteractivecalendar/data/exclusion_member.json", "w", encoding="utf-8") as f:#열외자 명단 저장(업데이트)
        json.dump(sorted_exclusion, f, ensure_ascii=False, indent=4)

    with open("/workspaces/Largeinteractivecalendar/data/onduty_member.json", "w", encoding="utf-8") as f:#당직 근무자 정보 저장(업데이트)
        json.dump(onduty_members, f, ensure_ascii=False, indent=4)

    file_path=f'/workspaces/Largeinteractivecalendar/data/OnDuty_Schedule/{year}년 {month}월 당직근무표.json'#근무 스케줄표 저장 경로 설정

    with open(file_path, "w", encoding="utf-8") as f:#근무 스케줄표와 열외자 명단 저장(업데이트)
        json.dump(onduty_schedule, f, ensure_ascii=False, indent=4)

    return onduty_schedule

    



