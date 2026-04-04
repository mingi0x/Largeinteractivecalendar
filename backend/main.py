from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

from onduty_member import get_onduty_members
from cafe_member import get_cafe_members
from CCTV_member import get_cctv_members, cctv_final_members, current_state
from update_exclusion import add_exclusion, remove_exclusion, return_exclusion
from is_member import is_member_cctv, is_first
from reset import reset_onduty_schedule, reset_cafe_schedule, reset_cctv_schedule
# from reset import reset_onduty_score, reset_cafe_score, reset_cctv_score
# from make_exclusion import get_exclusion

current_date={"year": 0, "month": 0, "day": 0}#현재 날짜 정보 초기화

app = FastAPI()

# 1. CORS 설정 (한 번만 선언하면 모든 엔드포인트에 적용됩니다)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 데이터 모델 정의 ---

class CalendarData(BaseModel):
    year: int
    month: int
    day: int
    type: str

class ExceptionChange(BaseModel):
    name: str
    action: str  # 'add' 또는 'remove'

# --- API 엔드포인트 ---

# @app.post("/api/reset-scheduler")##############################################killer#########################################################
# async def reset_scores():
#     reset_onduty_score()
#     reset_cafe_score()
#     reset_cctv_score()
#     print("모든 근무표 점수가 초기화되었습니다.")
#     return {"status": "success", "message": "모든 근무표 점수가 초기화되었습니다."}

# 1. 날짜 및 타입 정보 수신
@app.post("/api/calendar")
async def receive_calendar_data(data: CalendarData):
    current_date["year"] = data.year
    current_date["month"] = data.month
    current_date["day"] = data.day

    print(f"📅 [날짜 수신] 타입: {data.type}")
    print(f"   정보: {data.year}년 {data.month}월 {data.day}일")

    if(data.day!=0):
        exclusion=return_exclusion(data.year, data.month, data.day)
        return {"status": "success", "exclusion": exclusion}
    return {"status": "ok", "message": f"{data.year}-{data.month} 데이터 수신 완료"}

# 2. 열외자 명단 수신
@app.post("/api/update-exceptions")
async def update_exceptions(data: ExceptionChange):
    year = current_date["year"]
    month = current_date["month"]
    day = current_date["day"]

    if data.action == "remove":
        remove_exclusion(year,month,day,data.name)
        # 여기서 JSON 파일에서 해당 이름을 찾아 삭제하는 로직 수행
    elif data.action == "add":
        add_exclusion(year,month,day,data.name)
        # 여기서 JSON 파일에 해당 이름을 추가하는 로직 수행
        
    return {"status": "success", "processed_name": data.name}

# 3. 근무표 생성 요청
@app.post("/api/generate-cctv")#식청과 당직 근무표가 있어야 cctv 근무표를 생성 가능 또한 모든 근무표는 월별 순서가 맞아야 함
async def generate_cctv():
    # 여기에 실제 근무표 생성 로직 작성
    year = current_date["year"]
    month = current_date["month"]
    day = current_date["day"]


    exists_first=is_first(year, month)
    exists = is_member_cctv(year, month, day)

    if exists_first:
        if exists:
        # 파일이 있으면 아무것도 안 함
            print(f"이미 {year}-{month}-{day} 근무표가 있어서 생성을 건너뜁니다.")
            return {
                "status": "exists", 
                "message": "이미 근무표가 존재합니다."
            }
        else:
            # 파일이 없으면 생성
            get_cctv_members(year, month, day)
            cctv_schedule=cctv_final_members(year, month, day) 
            state=current_state(year, month, day)   
            print(f"새로운 {year}-{month}-{day} 근무표를 생성했습니다.")
            return {
                "status": "success", 
                "schedule": cctv_schedule,
                "state": state,
                "message": "새로운 근무표를 생성했습니다."
            }
    else:
        print(f"{year}-{month}의 당직 근무표와 식당 청소 근무표가 모두 있어야 CCTV 근무표를 생성할 수 있습니다.")
        return {
            "status": "error", 
            "message": "당직 근무표와 식당 청소 근무표가 모두 있어야 CCTV 근무표를 생성할 수 있습니다."
        }
    # 예: 파일 읽기 -> 알고리즘 실행 -> 결과 저장
    # success = run_generation_logic()
    
    return {"status": "success", "message": "Backend logic executed"}

@app.post("/api/generate-duty")#onduty:당직
async def generate_duty():
    year = current_date["year"]
    month = current_date["month"]

    onduty_schedule = get_onduty_members(year, month)
    print(f"📅 [당직 근무표 생성] {year}년 {month}월 당직 근무표가 생성되었습니다.")

    return {"status": "success", "schedule": onduty_schedule, "message": "당직 근무표 생성 로직이 실행되었습니다."}

@app.post("/api/generate-cafe")#cafe:식당청소
async def generate_cafe():
    year = current_date["year"]
    month = current_date["month"]

    cafe_schedule = get_cafe_members(year, month)
    print(f"📅 [식당 청소 근무표 생성] {year}년 {month}월 식당 청소 근무표가 생성되었습니다.")

    return {"status": "success", "schedule": cafe_schedule, "message": "식당 청소 근무표 생성 로직이 실행되었습니다."}


    #열외표 생성시 웹에 추가되게 아직 안바꿈

@app.post("/api/reset-duty")
def reset_duty():
    reset_onduty_schedule(current_date["year"], current_date["month"])
    print(f"📅 [당직 근무표 점수 초기화] {current_date['year']}년 {current_date['month']}월 당직 근무표 점수가 초기화되었습니다.")
    return {"status": "success", "message": "당직 근무표 점수 초기화 로직이 실행되었습니다."}
@app.post("/api/reset-cafe")
def reset_cafe():
    reset_cafe_schedule(current_date["year"], current_date["month"])
    print(f"📅 [식당 청소 근무표 점수 초기화] {current_date['year']}년 {current_date['month']}월 식당 청소 근무표 점수가 초기화되었습니다.")
    return {"status": "success", "message": "식당 청소 근무표 점수 초기화 로직이 실행되었습니다."}
@app.post("/api/reset-cctv")
def reset_cctv():
    reset_cctv_schedule(current_date["year"], current_date["month"], current_date["day"])
    print(f"📅 [CCTV 근무표 점수 초기화] {current_date['year']}년 {current_date['month']}월 {current_date['day']}일 CCTV 근무표 점수가 초기화되었습니다.")
    return {"status": "success", "message": "CCTV 근무표 점수 초기화 로직이 실행되었습니다."}