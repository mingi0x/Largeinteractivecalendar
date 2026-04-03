import { ArrowLeft, FileText, ClipboardList, Printer, Pencil } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useState, useEffect } from 'react';

// --- 달력 렌더링용 서브 컴포넌트 ---
function DutyCalendar({ data, title }: { data: any[], title: string }) {
  const WD_KO = ['일', '월', '화', '수', '목', '금', '토'];
  if (data.length === 0) return null;

  const dateMap: Record<string, string[]> = {};
  data.forEach(e => {
    if (!dateMap[e.날짜]) dateMap[e.날짜] = [];
    const names = Array.isArray(e.이름) ? e.이름 : [e.이름];
    names.forEach((n: string) => dateMap[e.날짜].push(n));
  });

  const [year, month] = data[0].날짜.split('-').map(Number);
  const firstDow = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const today = new Date();

  const cells = [];
  for (let i = 0; i < firstDow; i++) {
    cells.push(<div key={`empty-${i}`} className="bg-gray-50 border-r border-b border-gray-300 aspect-square" />);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dow = new Date(year, month - 1, d).getDay();
    const names = dateMap[dateStr] || [];
    const isToday = today.getFullYear() === year && today.getMonth() + 1 === month && today.getDate() === d;

    cells.push(
      <div key={d} className="border-r border-b border-gray-300 aspect-square p-1 flex flex-col overflow-hidden bg-white">
        <div className={`text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shrink-0
          ${dow === 0 ? 'text-red-500' : dow === 6 ? 'text-blue-500' : ''}
          ${isToday ? 'bg-red-500 text-white' : ''}`}>
          {d}
        </div>
        <div className="flex flex-col gap-0.5 mt-1 w-full">
          {names.map((n, idx) => (
            <div key={idx} className="text-[9px] font-medium border-l-2 border-slate-800 pl-1 py-0.5 bg-slate-50 w-full block leading-tight break-all">
              {n}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col p-4 bg-white overflow-y-auto">
      <div className="text-center mb-3">
        <h3 className="text-xl font-bold text-gray-800">{year}년 {month}월 {title}</h3>
      </div>
      <div className="grid grid-cols-7 border-t border-l border-gray-300">
        {WD_KO.map((wd, i) => (
          <div key={wd} className={`text-[11px] font-bold py-1.5 text-center border-r border-b border-gray-300 bg-gray-100
            ${i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : ''}`}>
            {wd}
          </div>
        ))}
        {cells}
      </div>
    </div>
  );
}

// --- 새 창 출력 함수 ---
function printCalendar(data: any[], title: string) {
  const WD_KO = ['일', '월', '화', '수', '목', '금', '토'];

  const dateMap: Record<string, string[]> = {};
  data.forEach(e => {
    if (!dateMap[e.날짜]) dateMap[e.날짜] = [];
    const names = Array.isArray(e.이름) ? e.이름 : [e.이름];
    names.forEach((n: string) => dateMap[e.날짜].push(n));
  });

  const [year, month] = data[0].날짜.split('-').map(Number);
  const firstDow = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const lastDow = new Date(year, month - 1, daysInMonth).getDay();

  const emptyCells = (count: number) =>
    Array(count).fill('<div class="day empty"></div>').join('');

  const dayCells = Array.from({ length: daysInMonth }, (_, i) => {
    const d = i + 1;
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dow = new Date(year, month - 1, d).getDay();
    const names = dateMap[dateStr] || [];
    const cls = ['day', dow === 0 ? 'sunday' : dow === 6 ? 'saturday' : ''].filter(Boolean).join(' ');
    const nameHTML = names.map(n => `<div class="name-entry">${n}</div>`).join('');
    return `<div class="${cls}"><div class="day-num">${d}</div><div class="names">${nameHTML}</div></div>`;
  }).join('');

  const html = `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<title>${year}년 ${month}월 ${title}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Noto Sans KR', sans-serif;
    background: #e0e0e0;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    min-height: 100vh;
    padding: 40px 0;
  }
  .page { width: 210mm; min-height: 297mm; padding: 14mm; display: flex; flex-direction: column; background: #fff; }
  .cal-header { text-align: center; margin-bottom: 10mm; border-bottom: 2px solid #111; padding-bottom: 8px; }
  .cal-title { font-size: 26px; font-weight: 700; }
  .cal-sub { font-size: 10px; color: #999; letter-spacing: 2px; margin-top: 3px; text-transform: uppercase; }
  .weekday-row { display: grid; grid-template-columns: repeat(7, 1fr); border-top: 1.5px solid #111; border-left: 1.5px solid #111; }
  .wd { border-right: 1.5px solid #111; border-bottom: 1.5px solid #111; padding: 6px 0; text-align: center; font-size: 10px; font-weight: 700; background: #f5f5f5; }
  .wd.sun { color: #d32f2f; } .wd.sat { color: #1565c0; }
  .cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); border-left: 1.5px solid #111; }
  .day { border-right: 1.5px solid #111; border-bottom: 1.5px solid #111; aspect-ratio: 1/1; padding: 6px 7px; display: flex; flex-direction: column; gap: 4px; background: #fff; }
  .day.empty { background: #fafafa; }
  .day-num { font-size: 11px; font-weight: 700; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; border-radius: 50%; }
  .day.sunday .day-num { color: #d32f2f; } .day.saturday .day-num { color: #1565c0; }
  .names { display: flex; flex-direction: column; gap: 3px; margin-top: 2px; }
  .name-entry { font-size: 9px; border-left: 2px solid #111; padding-left: 4px; line-height: 1.4; }
  @media print {
    @page { size: A4; margin: 0; }
    body { background: none; padding: 0; }
  }
</style>
</head>
<body>
<div class="page">
  <div class="cal-header">
    <div class="cal-title">${year}년 ${month}월 ${title}</div>
    <div class="cal-sub">Duty Roster</div>
  </div>
  <div class="weekday-row">
    ${WD_KO.map((d, i) => `<div class="wd ${i === 0 ? 'sun' : i === 6 ? 'sat' : ''}">${d}</div>`).join('')}
  </div>
  <div class="cal-grid">
    ${emptyCells(firstDow)}
    ${dayCells}
    ${emptyCells(6 - lastDow)}
  </div>
</div>
<script>window.onload = () => { window.print(); window.onafterprint = () => window.close(); }<\/script>
</body>
</html>`;

  const w = window.open('', '_blank');
  w?.document.write(html);
  w?.document.close();
}

// --- 메인 관리 뷰 컴포넌트 ---
export function MonthlyManagementView({ year, month, onBack }: { year: number, month: number, onBack: () => void }) {
  const [isLoading, setIsLoading] = useState(false);
  const [dutyData, setDutyData] = useState<any[] | null>(null);
  const [cafeData, setCafeData] = useState<any[] | null>(null);

  useEffect(() => {
    const savedDuty = localStorage.getItem(`duty_${year}_${month}`);
    const savedCafe = localStorage.getItem(`cafe_${year}_${month}`);
    if (savedDuty) setDutyData(JSON.parse(savedDuty));
    if (savedCafe) setCafeData(JSON.parse(savedCafe));
  }, [year, month]);

  useEffect(() => {
    if (dutyData) localStorage.setItem(`duty_${year}_${month}`, JSON.stringify(dutyData));
  }, [dutyData, year, month]);

  useEffect(() => {
    if (cafeData) localStorage.setItem(`cafe_${year}_${month}`, JSON.stringify(cafeData));
  }, [cafeData, year, month]);

  const handleReset = async (type: 'duty' | 'cafe') => {
    const endpoint = type === 'duty' ? 'reset-duty' : 'reset-cafe';

    try {
      const response = await fetch(`https://humble-system-v6ww966q6jr92x9ww-8000.app.github.dev/api/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      if (data.status === "success") {
        alert(data.message);
      }
    } catch (error) {
      console.error('API error:', error);
    }

    if (type === 'duty') {
      setDutyData(null);
      localStorage.removeItem(`duty_${year}_${month}`);
    } else {
      setCafeData(null);
      localStorage.removeItem(`cafe_${year}_${month}`);
    }
  };

  const fetchSchedule = async (type: 'duty' | 'cafe') => {
    if (isLoading) return;
    setIsLoading(true);
    const endpoint = type === 'duty' ? 'generate-duty' : 'generate-cafe';

    try {
      const response = await fetch(`https://humble-system-v6ww966q6jr92x9ww-8000.app.github.dev/api/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year, month }),
      });
      const data = await response.json();
      if (data.status === "success") {
        if (type === 'duty') setDutyData(data.schedule);
        else setCafeData(data.schedule);
      }
    } catch (error) {
      alert('오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-screen flex flex-col bg-gray-100 overflow-hidden">
      <div className="bg-white shadow-sm p-5 border-b shrink-0">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <Button onClick={onBack} variant="outline" size="icon"><ArrowLeft /></Button>
          <h1 className="text-2xl font-bold">{year}년 {month}월 부대 관리</h1>
        </div>
      </div>

      <div className="flex-1 overflow-hidden p-6 grid grid-cols-2 gap-6">
        {/* 당직 카드 */}
        <Card className="flex flex-col shadow-lg overflow-hidden border-none">
          <CardHeader className="bg-white border-b py-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <ClipboardList className="w-5 h-5" /> 당직 근무현황
              </CardTitle>
              <div className="flex items-center gap-2">
                {dutyData && (
                  <>
                    <Button
                      onClick={() => handleReset('duty')}
                      size="sm"
                      variant="outline"
                      className="border-red-300 text-red-500 hover:bg-red-50"
                    >
                      <Pencil className="mr-2 h-4 w-4" /> 수정하기
                    </Button>
                    <Button
                      onClick={() => printCalendar(dutyData, '당직 근무표')}
                      size="sm"
                      className="bg-black text-white hover:bg-gray-800"
                    >
                      <Printer className="mr-2 h-4 w-4" /> PDF 출력
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-0 overflow-hidden bg-white">
            {dutyData ? <DutyCalendar data={dutyData} title="당직 근무표" /> : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400"><p>당직표를 생성해 주세요</p></div>
            )}
          </CardContent>
        </Card>

        {/* 식당 카드 */}
        <Card className="flex flex-col shadow-lg overflow-hidden border-none">
          <CardHeader className="bg-white border-b py-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5" /> 식당 청소현황
              </CardTitle>
              <div className="flex items-center gap-2">
                {cafeData && (
                  <>
                    <Button
                      onClick={() => handleReset('cafe')}
                      size="sm"
                      variant="outline"
                      className="border-red-300 text-red-500 hover:bg-red-50"
                    >
                      <Pencil className="mr-2 h-4 w-4" /> 수정하기
                    </Button>
                    <Button
                      onClick={() => printCalendar(cafeData, '식당 청소표')}
                      size="sm"
                      className="bg-black text-white hover:bg-gray-800"
                    >
                      <Printer className="mr-2 h-4 w-4" /> PDF 출력
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-0 overflow-hidden bg-white">
            {cafeData ? <DutyCalendar data={cafeData} title="식당 청소표" /> : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400"><p>식당 청소표를 생성해 주세요</p></div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="p-6 bg-white border-t flex gap-4 justify-center">
        <Button onClick={() => fetchSchedule('duty')} disabled={isLoading || !!dutyData} className="w-48 h-12">당직표 생성</Button>
        <Button onClick={() => fetchSchedule('cafe')} disabled={isLoading || !!cafeData} className="w-48 h-12" variant="outline">식당청소표 생성</Button>
      </div>
    </div>
  );
}