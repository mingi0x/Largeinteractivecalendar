import json
import random
import os
from datetime import datetime, timedelta
#add_exclusion을 실행하지 않은 상태에서 하면 열외표가 없어서 에러 발생 가능
def get_cctv_members(year, month, day):
    date = f"{year}-{month:02d}-{day:02d}"  # 날짜 문자열 생성
    yesterday_worker=[]  # 어제 근무자 리스트 초기화
    yesterday_date = datetime(year, month, day) - timedelta(days=1)  # 어제 날짜 계산
    cctv_schedule=[]  # CCTV 근무 스케줄표 초기화
    
    file_path=f'/workspaces/Largeinteractivecalendar/data/CCTV_Schedule/{yesterday_date.year}년 {yesterday_date.month}월 {yesterday_date.day}일 CCTV근무표.json'
    if os.path.exists(file_path):  # 어제 근무표 파일이 존재하는지 확인
        with open(file_path, "r", encoding="utf-8") as f:  # 어제 근무표 불러오기
            yesterday_schedule = json.load(f)
            yesterday_worker = [entry["이름"] for entry in yesterday_schedule]  # 어제 근무자 이름 추출

    with open("/workspaces/Largeinteractivecalendar/data/all_member_data.json", "r", encoding="utf-8") as f:  # 전체 근무자 정보 로드
        all_members = json.load(f)

    with open("/workspaces/Largeinteractivecalendar/data/exclusion_member.json", "r", encoding="utf-8") as f:  # 열외자 정보 로드
        exclusion_members = json.load(f)

    weight=2.0 if exclusion_members.get(date, {}).get('type') == "휴일" else 1.0#휴일이면 가중치 2.0, 평일이면 가중치 1.0

    today_excluded=exclusion_members.get(date, {}).get('excluded', [])#오늘 열외자 명단 가져오기

    candidates=sorted(all_members, key=lambda x: x["CCTV점수"])#CCTV 점수 기준으로 근무자 정렬

    worker=[name for name in candidates if name["이름"] not in today_excluded and name["이름"] not in yesterday_worker]#열외자 명단에 없는 근무자 중에서 선정

    selected_worker=worker[:12]#선정된 근무자 중에서 상위 12명 선택

    random.shuffle(selected_worker)  # 선정된 근무자 리스트를 무작위로 섞음

    for worker in selected_worker:
        all_members[all_members.index(worker)]["CCTV점수"]+=weight#선정된 근무자의 CCTV 점수 증가
        cctv_schedule.append({"이름":worker["이름"], "CCTV점수": all_members[all_members.index(worker)]["CCTV점수"]})#근무 스케줄표에 선정된 근무자 이름과 점수 추가
        exclusion_members[date]['excluded'].extend([worker["이름"]])#오늘 날짜의 열외자 명단에 선정된 근무자 추가

    file_path=f'/workspaces/Largeinteractivecalendar/data/CCTV_Schedule/{year}년 {month}월 {day}일 CCTV근무표.json'#근무 스케줄표 저장 경로 설정
    with open(file_path, "w", encoding="utf-8") as f:#근무 스케줄표 저장
        json.dump(cctv_schedule, f, ensure_ascii=False, indent=4)

    sorted_exclusion=dict(sorted(exclusion_members.items(), key=lambda x:datetime.strptime(x[0], "%Y-%m-%d")))#정렬된 열외자 명단을 딕셔너리로 변환
    with open("/workspaces/Largeinteractivecalendar/data/exclusion_member.json", "w", encoding="utf-8") as f:#열외자 명단 저장(업데이트)
        json.dump(sorted_exclusion, f, ensure_ascii=False, indent=4)
    
    with open("/workspaces/Largeinteractivecalendar/data/all_member_data.json", "w", encoding="utf-8") as f:#전체 근무자 정보 저장(업데이트)
        json.dump(all_members, f, ensure_ascii=False, indent=4)

def cctv_final_members(year, month, day):
    file_path=f'/workspaces/Largeinteractivecalendar/data/CCTV_Schedule/{year}년 {month}월 {day}일 CCTV근무표.json'#근무 스케줄표 저장 경로 설정
    with open(file_path, "r", encoding="utf-8") as f:#근무 스케줄표 불러오기
        cctv_schedule = json.load(f)

    final_cctv_schedule=[]

    for i in range(0,12,2):
        group_num=(i//2)+1

        m1=cctv_schedule[i]['이름']
        m2=cctv_schedule[i+1]['이름']

        h = 8 + (i // 2 * 2)
        nh = (20 + (i // 2 * 2)) % 24

        group_info = {
            f"{group_num}조": {
                "주간": {
                    f"{h:02d}:00-{h:02d}:30": m1,
                    f"{h:02d}:30-{h+1:02d}:00": m2,
                    f"{h+1:02d}:00-{h+1:02d}:30": m1,
                    f"{h+1:02d}:30-{h+2:02d}:00": m2
                },
                "야간": {
                    f"{nh:02d}:00-{nh:02d}:30": m1,
                    f"{nh:02d}:30-{nh+1:02d}:00": m2,
                    f"{nh+1:02d}:00-{nh+1:02d}:30": m1,
                    f"{nh+1:02d}:30-{nh+2:02d}:00": m2
                }
            }
        }
        final_cctv_schedule.append(group_info)

    return final_cctv_schedule

def current_state(year, month, day):
    base_date_str="2026-03-23"
    target_date_str=f"{year}-{month:02d}-{day:02d}"
    date_format="%Y-%m-%d"

    # 기준일(3월 23일)과 확인할 날짜 설정
    base_date = datetime.strptime(base_date_str, date_format)
    target_date = datetime.strptime(target_date_str, date_format)

    # 두 날짜의 차이 계산 (일 단위)
    delta_days=(target_date - base_date).days

    # 몇 주가 지났는지 계산 (7일로 나눔)
    weeks_passed=delta_days // 7

    # 2주 단위로 순환 (0, 1, 0, 1...)
    # 0이면 'a', 1이면 'b'
    cycle = (weeks_passed // 2) % 2

    return "여단 CCTV" if cycle == 0 else "대대 CCTV"

    


