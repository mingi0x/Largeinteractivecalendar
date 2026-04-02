import json
import calendar
from datetime import datetime

def get_cafe_members(year, month):
    last_day=calendar.monthrange(year, month)[1]#해당 월의 마지막 날짜 가져오기
    cafe_schedule=[]#식당 근무 스케줄표 초기화
    yesterday_worker=[]#어제 근무자 초기화

    dates = [f"{year}-{month:02d}-{day:02d}" for day in range(1, last_day + 1)]#해당 월의 모든 날짜 생성

    for date in dates:#각 날짜에 대해 식당 근무자 선정
        date_str=date

        with open("/workspaces/Largeinteractivecalendar/data/all_member_data.json", "r", encoding="utf-8") as f:#전체 근무자 정보 로드
            all_members = json.load(f)

        candidates=sorted(all_members, key=lambda x: x["식당청소점수"])#당직 점수 기준으로 근무자 정렬
        
        with open("/workspaces/Largeinteractivecalendar/data/exclusion_member.json", "r", encoding="utf-8") as f:#열외자 정보 로드
            exclusion_members = json.load(f)

        today_excluded=exclusion_members.get(date_str, []).get('excluded', [])#오늘 열외자 명단 가져오기

        worker=[name for name in candidates if name["이름"] not in today_excluded and name["이름"] not in yesterday_worker]#열외자 명단에 없는 근무자 중에서 선정

        selected_worker=worker[:2]#선정된 근무자 중에서 상위 2명 선택

        day_name=datetime.strptime(date, "%Y-%m-%d").strftime("%A")#요일 이름 가져오기

        cafe_schedule.append({"날짜": date_str, "요일": day_name, "이름": [worker["이름"] for worker in selected_worker]})#근무 스케줄표에 오늘 날짜, 요일, 선정된 근무자 이름 추가

        if selected_worker:
            for worker in selected_worker:
                all_members[all_members.index(worker)]["식당청소점수"]+=1#선정된 근무자의 당직 점수 증가
                if worker['이름'] not in exclusion_members.get(date_str, []).get('excluded', []):#오늘 날짜의 열외자 명단에 선정된 근무자가 없으면 추가
                    exclusion_members[date_str]['excluded'].extend([worker["이름"]])#오늘 날짜의 열외자 명단에 선정된 근무자 추가
            

        yesterday_worker=[worker["이름"] for worker in selected_worker]#오늘 선정된 근무자를 내일의 어제 근무자로 저장

        with open("/workspaces/Largeinteractivecalendar/data/exclusion_member.json", "w", encoding="utf-8") as f:#열외자 명단 저장(업데이트)
            json.dump(exclusion_members, f, ensure_ascii=False, indent=4)
        with open("/workspaces/Largeinteractivecalendar/data/all_member_data.json", "w", encoding="utf-8") as f:#전체 근무자 정보 저장(업데이트)
            json.dump(all_members, f, ensure_ascii=False, indent=4)

    file_path=f'/workspaces/Largeinteractivecalendar/data/Cafe_Schedule/{year}년 {month}월 식당청소근무표.json'#근무 스케줄표 저장 경로 설정

    with open(file_path, "w", encoding="utf-8") as f:#근무 스케줄표 저장
        json.dump(cafe_schedule, f, ensure_ascii=False, indent=4)

    