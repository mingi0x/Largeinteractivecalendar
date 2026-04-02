import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Plus, Trash2, FileText, Printer } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

// 인원 데이터 로드
import allMemberData from '/workspaces/Largeinteractivecalendar/data/all_member_data.json';

interface ExceptionPerson {
  id: string;
  name: string;
  reason: string;
}

interface DailyManagementViewProps {
  selectedDate: Date;
  onBack: () => void;
}

// 명단 생성
const SAMPLE_PEOPLE = allMemberData.map((person: any) => `${person.이름}`);

export function DailyManagementView({ selectedDate, onBack }: DailyManagementViewProps) {
  // 1. 열외자 상태 (기존 로직 유지)
  const [exceptions, setExceptions] = useState<ExceptionPerson[]>(() => {
    const saved = localStorage.getItem(`exceptions_${selectedDate.toDateString()}`);
    return saved ? JSON.parse(saved) : [];
  });
  
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dutyGenerated, setDutyGenerated] = useState(false);
  const [dutyData, setDutyData] = useState<any[] | null>(null); // 근무표 JSON 데이터 저장

  // exceptions 변경 시 로컬 스토리지 저장 (기존 로직)
  useEffect(() => {
    localStorage.setItem(
      `exceptions_${selectedDate.toDateString()}`,
      JSON.stringify(exceptions)
    );
  }, [exceptions, selectedDate]);

  const formatDate = (date: Date) => {
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
  };

  const filteredPeople = SAMPLE_PEOPLE.filter((name) =>
    name.includes(searchQuery)
  );

  // 열외자 추가 (기존 로직)
  const handleAddPerson = (name: string) => {
    if (exceptions.some((ex) => ex.name === name)) {
      alert('이미 추가된 인원입니다.');
      return;
    }
    const newException = { id: Date.now().toString(), name, reason: '' };
    setExceptions([...exceptions, newException]);
    setShowSearch(false);
    setSearchQuery('');
  };

  // 열외자 삭제 (기존 로직)
  const handleRemoveException = (id: string) => {
    setExceptions(exceptions.filter((ex) => ex.id !== id));
  };

  // 열외 사유 업데이트 (기존 로직)
  const handleUpdateException = (id: string, value: string) => {
    setExceptions(
      exceptions.map((ex) =>
        ex.id === id ? { ...ex, reason: value } : ex
      )
    );
  };

  // 핵심: [근무표 생성하기] 버튼 누를 때 로컬 JSON 파일 읽기
  const handleGenerateDuty = async () => {
  try {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth() + 1;
    const day = selectedDate.getDate();

    // 1. 서버에 생성 요청 (POST)
    const response = await fetch("https://humble-system-v6ww966q6jr92x9ww-8000.app.github.dev/api/generate-cctv", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ year, month, day }),
    });

    if (!response.ok) throw new Error("서버 응답 에러");

    const result = await response.json();

    // 2. 서버가 보내준 데이터를 바로 사용 (파일 fetch 제거!)
    if (result.status === "success" && result.schedule) {
      setDutyData(result.schedule); // 서버가 준 데이터를 그대로 넣음
      setDutyGenerated(true);
      alert("✅ 근무표가 생성되어 화면에 표시되었습니다.");
    } else {
      alert("❌ 생성 실패: " + result.message);
    }
  } catch (error) {
    console.error("클라이언트 측 최종 에러:", error);
    alert("근무표를 불러오는 중 오류가 발생했습니다. (JSON 파싱 에러)");
  }
};

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-gray-50">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-area { width: 100% !important; padding: 0 !important; margin: 0 !important; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid black !important; padding: 4px !important; }
        }
        .duty-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        .duty-table th, .duty-table td { border: 1px solid #000; padding: 8px; text-align: center; }
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
        {/* 왼쪽: 열외표 (기존 기능 100% 유지) */}
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
              <Button variant="outline" onClick={() => { setShowSearch(false); setSearchQuery(''); }} className="w-full mt-2" size="sm">
                취소
              </Button>
            </div>
          )}

          <div className="space-y-2">
            {exceptions.map((ex) => (
              <div key={ex.id} className="p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <span className="font-semibold">{ex.name}</span>
                  <Select value={ex.reason} onValueChange={(val) => handleUpdateException(ex.id, val)}>
                    <SelectTrigger className="w-32 h-8 text-xs"><SelectValue placeholder="사유 선택" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="휴가">휴가</SelectItem>
                      <SelectItem value="외출">외출</SelectItem>
                      <SelectItem value="외박">외박</SelectItem>
                      <SelectItem value="배차">배차</SelectItem>
                      <SelectItem value="출장">출장</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleRemoveException(ex.id)} className="h-7 w-7">
                  <Trash2 className="h-3.5 w-3.5 text-red-500" />
                </Button>
              </div>
            ))}
          </div>

          <Button onClick={handleGenerateDuty} className="w-full mt-6 py-6 text-base" disabled={exceptions.length === 0}>
            근무표 생성하기
          </Button>
        </div>

        {/* 오른쪽: 근무표 (파일 로드 시 렌더링) */}
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
              <p>열외 입력 후 버튼을 누르면 JSON 파일을 불러옵니다</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-200">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold underline mb-1">{formatDate(selectedDate)} 경계 작전 명령서</h2>
                <p className="text-sm text-gray-500 font-mono">주간 08:00~20:00 / 야간 20:00~익일 08:00</p>
              </div>
              <table className="duty-table">
                <thead>
                  <tr>
                    <th>조</th>
                    <th>주간 시간</th>
                    <th>주간 근무자</th>
                    <th>야간 시간</th>
                    <th>야간 근무자</th>
                  </tr>
                </thead>
                <tbody>
                  {dutyData.map((group: any, gIdx: number) => {
                    const joName = Object.keys(group)[0];
                    const daySlots = Object.entries(group[joName].주간);
                    const nightSlots = Object.entries(group[joName].야간) as any;
                    return daySlots.map(([time, name], i) => (
                      <tr key={`${gIdx}-${i}`}>
                        {i === 0 && <td rowSpan={daySlots.length} className="font-bold bg-gray-50">{joName}</td>}
                        <td>{time}</td>
                        <td>{name as string}</td>
                        <td>{nightSlots[i][0]}</td>
                        <td>{nightSlots[i][1]}</td>
                      </tr>
                    ));
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