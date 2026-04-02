import json
import os

def reset_cafe_score():
    with open("/workspaces/Largeinteractivecalendar/data/all_member_data.json", "r", encoding="utf-8") as f:
        members = json.load(f)
    
    for member in members:
        member["식당청소점수"] = 0.0
    
    with open("/workspaces/Largeinteractivecalendar/data/all_member_data.json", "w", encoding="utf-8") as f:
        json.dump(members, f, ensure_ascii=False, indent=4)

    file_path="/workspaces/Largeinteractivecalendar/data/Cafe_Schedule"
    for filename in os.listdir(file_path):
        os.remove(os.path.join(file_path, filename))

def reset_cctv_score():
    with open("/workspaces/Largeinteractivecalendar/data/all_member_data.json", "r", encoding="utf-8") as f:
        members = json.load(f)
    
    for member in members:
        member["CCTV점수"] = 0.0
    
    with open("/workspaces/Largeinteractivecalendar/data/all_member_data.json", "w", encoding="utf-8") as f:
        json.dump(members, f, ensure_ascii=False, indent=4)

    file_path="/workspaces/Largeinteractivecalendar/data/CCTV_Schedule"
    for filename in os.listdir(file_path):
        os.remove(os.path.join(file_path, filename))

def reset_onduty_score():
    with open("/workspaces/Largeinteractivecalendar/data/onduty_member.json", "r", encoding="utf-8") as f:
        members = json.load(f)
    
    for member in members:
        member["당직점수"] = 0.0
    
    with open("/workspaces/Largeinteractivecalendar/data/onduty_member.json", "w", encoding="utf-8") as f:
        json.dump(members, f, ensure_ascii=False, indent=4)

    file_path="/workspaces/Largeinteractivecalendar/data/OnDuty_Schedule"
    for filename in os.listdir(file_path):
        os.remove(os.path.join(file_path, filename))