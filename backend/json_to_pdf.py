import json
import datetime
import asyncio
import nest_asyncio
from pathlib import Path

class JsonToPdfConverter:
    def __init__(self, base_date="2026-03-23"):
        self.base_date = datetime.datetime.strptime(base_date, "%Y-%m-%d")
        self.dow_map = {0:"월", 1:"화", 2:"수", 3:"목", 4:"금", 5:"토", 6:"일"}
        self.css = """
        * { margin:0; padding:0; box-sizing:border-box; }
        body { font-family: 'Malgun Gothic', sans-serif; background: #fff; font-size: 13px; }
        .page { width: 210mm; padding: 16mm 14mm; page-break-after: always; }
        .doc-title { text-align: center; border-bottom: 3px solid #000; padding-bottom: 10px; margin-bottom: 16px; }
        .doc-title h1 { font-size: 17px; font-weight: 700; }
        table { width: 100%; border-collapse: collapse; }
        th { background: #1a1a1a; color: #fff; padding: 7px; border: 1px solid #000; }
        td { padding: 5px 7px; border: 1px solid #ddd; text-align: center; }
        .col-jo { font-weight: 700; background: #f5f5f5; vertical-align: middle; }
        .day-col { background: #fffdf5; }
        .night-col { background: #f5f5ff; }
        tr.jo-border td { border-top: 2px solid #777; }
        """

    def _get_unit_status(self, target_date_str):
        """여단/대대 CCTV 로테이션 판단 로직"""
        target_date = datetime.datetime.strptime(target_date_str, "%Y-%m-%d")
        delta_days = (target_date - self.base_date).days
        weeks_passed = delta_days // 7
        cycle = (weeks_passed // 2) % 2
        return "여단 CCTV" if cycle == 0 else "대대 CCTV"

    def parse_json_data(self, raw_json):
        """JSON 데이터를 내부 표준 구조로 변환"""
        parsed_jos = []
        for item in raw_json:
            for jo_key, content in item.items():
                jo_num = int(jo_key.replace('조', '').strip())
                day_slots = [{"t": t, "n": n} for t, n in content["주간"].items()]
                night_slots = [{"t": t, "n": n} for t, n in content["야간"].items()]
                parsed_jos.append({"jo": jo_num, "day": day_slots, "night": night_slots})
        return parsed_jos

    def build_html(self, date_str, parsed_jos):
        """HTML 문서 생성"""
        d = datetime.date.fromisoformat(date_str)
        title = f"{d.year}년 {d.month:02d}월 {d.day:02d}일({self.dow_map[d.weekday()]}) 경계 작전 명령서({self._get_unit_status(date_str)})"
        
        rows = ""
        for ji, j in enumerate(parsed_jos):
            span = len(j["day"])
            for i, s in enumerate(j["day"]):
                border_cls = "jo-border" if (ji > 0 and i == 0) else ""
                jo_cell = f'<td class="col-jo" rowspan="{span}">{j["jo"]}조</td>' if i == 0 else ""
                rows += f"""
                <tr class="{border_cls}">
                    {jo_cell}
                    <td class="day-col">{s['t']}</td><td class="day-col">{s['n']}</td>
                    <td class="night-col">{j['night'][i]['t']}</td><td class="night-col">{j['night'][i]['n']}</td>
                </tr>"""

        return f"""<!DOCTYPE html><html><head><meta charset="UTF-8"><style>{self.css}</style></head>
        <body><div class="page"><div class="doc-title"><h1>{title}</h1></div>
        <table><thead><tr><th>조</th><th>주간 시간</th><th>주간 근무자</th><th>야간 시간</th><th>야간 근무자</th></tr></thead>
        <tbody>{rows}</tbody></table></div></body></html>"""

    async def generate_pdf(self, html_str, out_path):
        """Playwright를 이용한 PDF 렌더링 및 저장"""
        from playwright.async_api import async_playwright
        async with async_playwright() as p:
            browser = await p.chromium.launch()
            page = await browser.new_page()
            await page.set_content(html_str, wait_until="networkidle")
            await page.pdf(path=out_path, format="A4", print_background=True)
            await browser.close()
        print(f"파일 저장 완료: {out_path}")