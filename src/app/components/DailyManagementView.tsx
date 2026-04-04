import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Plus, Trash2, FileText, Printer, Pencil } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

import allMemberData from '/workspaces/Largeinteractivecalendar/data/all_member_data.json';

interface ExceptionPerson {
  id: string;
  name: string;
  reason: string;
}

interface DailyManagementViewProps {
  selectedDate: Date;
  onBack: () => void;
  externalData?: any[];
  isLoading: boolean;
}

const notifyPythonAboutChange = async (name: string, action: 'add' | 'remove') => {
  try {
    await fetch('https://humble-system-v6ww966q6jr92x9ww-8000.app.github.dev/api/update-exceptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, action }),
    });
  } catch (error) {
    console.error('Python 서버 통신 실패:', error);
  }
};

const SAMPLE_PEOPLE = allMemberData.map((person: any) => `${person.이름}`);

export function DailyManagementView({ selectedDate, onBack, externalData, isLoading }: DailyManagementViewProps) {
  const dateKey = selectedDate.toDateString();

  const [exceptions, setExceptions] = useState<ExceptionPerson[]>(() => {
    const saved = localStorage.getItem(`exceptions_${dateKey}`);
    return saved ? JSON.parse(saved) : [];
  });

  const [dutyData, setDutyData] = useState<any[] | null>(() => {
    const saved = localStorage.getItem(`duty_daily_${dateKey}`);
    return saved ? JSON.parse(saved) : null;
  });

  const [dutyState, setDutyState] = useState<string>(() => {
  return localStorage.getItem(`duty_state_${dateKey}`) ?? '';
});

  const [dutyGenerated, setDutyGenerated] = useState<boolean>(() => {
    return !!localStorage.getItem(`duty_daily_${dateKey}`);
  });

  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (externalData && Array.isArray(externalData)) {
      // 💡 핵심: 기존 데이터(prev)를 무시하고 새 데이터로 '완전히 교체'합니다.
      const processed = externalData.map((name: string, index: number) => ({
        id: `${Date.now()}-${index}-${Math.random().toString(36).substring(2, 5)}`,
        name: name,
        reason: ''
      }));

      // [...prev, ...processed] 대신 processed만 넣으세요.
      setExceptions(processed); 
    }
  }, [externalData]);

  useEffect(() => {
    localStorage.setItem(`exceptions_${dateKey}`, JSON.stringify(exceptions));
  }, [exceptions, dateKey]);

  useEffect(() => {
    if (dutyData) {
      localStorage.setItem(`duty_daily_${dateKey}`, JSON.stringify(dutyData));
    }
  }, [dutyData, dateKey]);

  useEffect(() => {
    setExceptions([]); // 날짜 변경 시 초기화
  }, [dateKey]);

  const formatDate = (date: Date) => {
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
  };

  const filteredPeople = SAMPLE_PEOPLE.filter((name) => name.includes(searchQuery));

  const handleAddPerson = (name: string) => {
    if (exceptions.some((ex) => ex.name === name)) {
      alert('이미 추가된 인원입니다.');
      return;
    }
    notifyPythonAboutChange(name, 'add');
    setExceptions([...exceptions, { id: Date.now().toString(), name, reason: '' }]);
    setShowSearch(false);
    setSearchQuery('');
  };

  const handleRemoveException = (id: string) => {
    const personToRemove = exceptions.find((ex) => ex.id === id);
    if (personToRemove) {
      setExceptions(exceptions.filter((ex) => ex.id !== id));
      notifyPythonAboutChange(personToRemove.name, 'remove');
    }
  };

  const handleUpdateException = (id: string, value: string) => {
    setExceptions(exceptions.map((ex) => (ex.id === id ? { ...ex, reason: value } : ex)));
  };

  const handleEdit = async () => {
    try {
      const response = await fetch(`https://humble-system-v6ww966q6jr92x9ww-8000.app.github.dev/api/reset-cctv`, {
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
    setDutyGenerated(false);
    setDutyData(null);
    localStorage.removeItem(`duty_daily_${dateKey}`);
    setDutyState('');
    localStorage.removeItem(`duty_state_${dateKey}`);
  };

  const handleGenerateDuty = async () => {
    try {
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth() + 1;
      const day = selectedDate.getDate();

      const response = await fetch(
        'https://humble-system-v6ww966q6jr92x9ww-8000.app.github.dev/api/generate-cctv',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ year, month, day }),
        }
      );

      if (!response.ok) throw new Error('서버 응답 에러');

      const result = await response.json();

      if (result.status === 'success' && result.schedule) {
        setDutyData(result.schedule);
        setDutyState(result.state ?? '');
        localStorage.setItem(`duty_state_${dateKey}`, result.state ?? '');
        setDutyGenerated(true);
        alert('✅ 근무표가 생성되어 화면에 표시되었습니다.');
      } else {
        alert('❌ 생성 실패: ' + result.message);
      }
    } catch (error) {
      console.error('클라이언트 측 최종 에러:', error);
      alert('근무표를 불러오는 중 오류가 발생했습니다.');
    }
  };

  const handlePrint = () => window.print();

  return (
    <div className="min-h-screen w-full flex flex-col bg-gray-50">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-area {
            width: 100% !important;
            padding: 12mm 10mm !important;
            margin: 0 !important;
            background: #fff !important;
          }
          .duty-card { box-shadow: none !important; border: none !important; }
        }

        /* ── 근무표 테이블 ── */
        .duty-table {
          width: 100%;
          border-collapse: collapse;
          font-family: 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif;
          font-size: 12.5px;
        }
        .duty-table thead tr { color: #fff; }
        .duty-table thead th {
          padding: 8px 6px;
          font-weight: 600;
          text-align: center;
          font-size: 11.5px;
          letter-spacing: 0.3px;
        }
        .duty-table thead th.th-base  { background: #2c2c2c; }
        .duty-table thead th.th-day   { background: #3a3a3a; }
        .duty-table thead th.th-night { background: #2a2a5a; }

        .duty-table td {
          padding: 6px 8px;
          border: 1px solid #ddd;
          vertical-align: middle;
        }
        .duty-table td.col-jo {
          width: 52px;
          text-align: center;
          font-weight: 700;
          font-size: 13px;
          background: #f4f4f4;
          color: #111;
          vertical-align: middle;
        }
        .duty-table td.col-time {
          width: 100px;
          text-align: center;
          font-size: 11.5px;
          color: #444;
          font-weight: 500;
          font-variant-numeric: tabular-nums;
        }
        .duty-table td.col-name {
          font-size: 12.5px;
          font-weight: 600;
          padding-left: 14px;
        }
        .duty-table td.day-col   { background: #fffef5; }
        .duty-table td.night-col { background: #f5f5ff; }
        .duty-table tr.jo-border td { border-top: 2px solid #888 !important; }
      `}</style>

      {/* 헤더 */}
      <div className="bg-white shadow-sm p-4 border-b flex items-center justify-between no-print">
        <div className="flex items-center gap-3">
          <Button onClick={onBack} variant="outline" size="icon" className="h-10 w-10">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">{formatDate(selectedDate)}</h1>
        </div>
        <div className="text-lg text-gray-600">열외·근무 관리</div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* 왼쪽: 열외표 */}
        <div className="w-1/2 border-r border-gray-200 bg-white p-6 overflow-y-auto no-print">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-700">열외 현황</h2>
            <div className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-medium">
              {exceptions.length}명
            </div>
          </div>

          {!showSearch && (
            <button
              onClick={() => setShowSearch(true)}
              className="w-full py-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors mb-4"
            >
              <Plus className="h-5 w-5 mx-auto mb-2 text-gray-400" />
              <span className="text-gray-600">열외자 추가</span>
            </button>
          )}

          {showSearch && (
            <div className="mb-4 p-4 border-2 border-blue-300 rounded-lg bg-blue-50">
              <Input
                type="text"
                placeholder="이름을 입력하세요"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mb-2"
                autoFocus
              />
              <div className="max-h-40 overflow-y-auto space-y-1">
                {filteredPeople.map((name) => (
                  <button
                    key={name}
                    onClick={() => handleAddPerson(name)}
                    className="w-full text-left px-3 py-2 hover:bg-white rounded transition-colors text-sm"
                  >
                    {name}
                  </button>
                ))}
              </div>
              <Button
                variant="outline"
                onClick={() => { setShowSearch(false); setSearchQuery(''); }}
                className="w-full mt-2"
                size="sm"
              >
                취소
              </Button>
            </div>
          )}

        {/* 📋 리스트 영역 (스켈레톤 vs 실제 데이터) */}
          <div className="space-y-2">
            {isLoading ? (
              /* 🦴 데이터 로딩 중: 스켈레톤 UI 표시 */
              Array.from({ length: Math.max(exceptions.length, 5) }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-100 border border-gray-200 rounded-lg animate-pulse">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="h-5 w-16 bg-gray-300 rounded"></div>
                    <div className="h-8 w-32 bg-gray-300 rounded"></div>
                  </div>
                  <div className="h-7 w-7 bg-gray-300 rounded-full"></div>
                </div>
              ))
            ) : (
              /* ✅ 로딩 완료: 실제 데이터 표시 */
              exceptions.map((ex) => (
                <div
                  key={ex.id}
                  className="p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <span className="font-semibold">{ex.name}</span>
                    <Select value={ex.reason} onValueChange={(val) => handleUpdateException(ex.id, val)}>
                      <SelectTrigger className="w-32 h-8 text-xs">
                        <SelectValue placeholder="사유 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="휴가">휴가</SelectItem>
                        <SelectItem value="외출">외출</SelectItem>
                        <SelectItem value="외박">외박</SelectItem>
                        <SelectItem value="배차">배차</SelectItem>
                        <SelectItem value="출장">출장</SelectItem>
                        <SelectItem value="자동 추가">자동 추가</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveException(ex.id)}
                    className="h-7 w-7"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-red-500" />
                  </Button>
                </div>
              ))
            )}
          </div>

          {dutyGenerated ? (
            <Button
              onClick={handleEdit}
              variant="outline"
              className="w-full mt-6 py-6 text-base border-red-300 text-red-500 hover:bg-red-50"
            >
              <Pencil className="mr-2 h-4 w-4" /> 수정하기
            </Button>
          ) : (
            <Button
              onClick={handleGenerateDuty}
              className="w-full mt-6 py-6 text-base"
              disabled={exceptions.length === 0}
            >
              근무표 생성하기
            </Button>
          )}
        </div>

        {/* 오른쪽: 근무표 */}
        <div className="w-1/2 bg-gray-50 p-6 overflow-y-auto print-area">
          <div className="flex items-center justify-between mb-4 no-print">
            <h2 className="text-xl font-semibold text-gray-700">근무표 미리보기</h2>
            {dutyGenerated && (
              <Button onClick={handlePrint} variant="outline" size="sm">
                <Printer className="mr-2 h-4 w-4" /> PDF 출력
              </Button>
            )}
          </div>

          {!dutyGenerated || !dutyData ? (
            <div className="flex flex-col items-center justify-center h-[calc(100%-5rem)] text-gray-400 no-print">
              <FileText className="h-16 w-16 mb-4 text-gray-300" />
              <p>열외 입력 후 버튼을 누르면 근무표가 생성됩니다</p>
            </div>
          ) : (
            <div className="duty-card bg-white rounded-lg shadow-sm p-8 border border-gray-200">
              {/* 문서 제목 */}
              <div
                style={{
                  textAlign: 'center',
                  borderBottom: '3px solid #000',
                  paddingBottom: '10px',
                  marginBottom: '18px',
                }}
              >
                <h2 style={{ fontSize: '17px', fontWeight: 700, letterSpacing: '1.5px' }}>
                  {formatDate(selectedDate)} 경계 작전 명령서{dutyState ? `(${dutyState})` : ''}
                </h2>
                <p style={{ fontSize: '11px', color: '#555', marginTop: '4px' }}>
                  주간 08:00 ~ 20:00 &nbsp;|&nbsp; 야간 20:00 ~ 익일 08:00
                </p>
              </div>

              {/* 근무표 테이블 */}
              <table className="duty-table">
                <thead>
                  <tr>
                    <th className="th-base" style={{ width: '52px' }}>조</th>
                    <th className="th-day"  style={{ width: '100px' }}>주간 시간대</th>
                    <th className="th-day">주간 근무자</th>
                    <th className="th-night" style={{ width: '100px' }}>야간 시간대</th>
                    <th className="th-night">야간 근무자</th>
                  </tr>
                </thead>
                <tbody>
                  {dutyData.map((group: any, gIdx: number) => {
                    const joName = Object.keys(group)[0];
                    const daySlots = Object.entries(group[joName].주간);
                    const nightSlots = Object.entries(group[joName].야간) as [string, string][];

                    return daySlots.map(([dayTime, dayName], i) => {
                      const isFirst = i === 0;
                      const isBorder = gIdx > 0 && isFirst;
                      return (
                        <tr key={`${gIdx}-${i}`} className={isBorder ? 'jo-border' : ''}>
                          {isFirst && (
                            <td className="col-jo" rowSpan={daySlots.length}>
                              {joName}
                            </td>
                          )}
                          <td className="col-time day-col">{dayTime}</td>
                          <td className="col-name day-col">{dayName as string}</td>
                          <td className="col-time night-col">{nightSlots[i][0]}</td>
                          <td className="col-name night-col">{nightSlots[i][1]}</td>
                        </tr>
                      );
                    });
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}