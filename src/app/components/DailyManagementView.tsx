import { useState } from 'react';
import { ArrowLeft, Plus, Trash2, FileText } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

interface ExceptionPerson {
  id: string;
  name: string;
  reason: string;
}

interface DailyManagementViewProps {
  selectedDate: Date;
  onBack: () => void;
}

// 샘플 인원 데이터
const SAMPLE_PEOPLE = [
  '김영철',
  '이민수',
  '박지훈',
  '정수연',
  '최동욱',
  '강민지',
  '윤서준',
  '임하은',
  '조성민',
  '한예린',
];

export function DailyManagementView({ selectedDate, onBack }: DailyManagementViewProps) {
  const [exceptions, setExceptions] = useState<ExceptionPerson[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dutyGenerated, setDutyGenerated] = useState(false);

  const formatDate = (date: Date) => {
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
  };

  const filteredPeople = SAMPLE_PEOPLE.filter((name) =>
    name.includes(searchQuery)
  );

  const handleAddPerson = (name: string) => {
    // 중복 체크
    if (exceptions.some((ex) => ex.name === name)) {
      alert('이미 추가된 인원입니다.');
      return;
    }

    const newException: ExceptionPerson = {
      id: Date.now().toString(),
      name,
      reason: '',
    };
    setExceptions([...exceptions, newException]);
    setShowSearch(false);
    setSearchQuery('');
  };

  const handleRemoveException = (id: string) => {
    setExceptions(exceptions.filter((ex) => ex.id !== id));
  };

  const handleUpdateException = (id: string, value: string) => {
    setExceptions(
      exceptions.map((ex) =>
        ex.id === id ? { ...ex, reason: value } : ex
      )
    );
  };

  const handleGenerateDuty = () => {
    setDutyGenerated(true);
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            onClick={onBack}
            variant="outline"
            size="icon"
            className="h-10 w-10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">{formatDate(selectedDate)}</h1>
        </div>
        <div className="text-lg text-gray-600">열외·근무 관리</div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="flex-1 flex">
        {/* 왼쪽: 열외표 */}
        <div className="w-1/2 border-r border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-700">열외 현황</h2>
            <div className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-medium">
              {exceptions.length}명
            </div>
          </div>

          {/* 열외자 추가 버튼 */}
          {!showSearch && (
            <button
              onClick={() => setShowSearch(true)}
              className="w-full py-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors mb-4"
            >
              <Plus className="h-5 w-5 mx-auto mb-2 text-gray-400" />
              <span className="text-gray-600">열외자 추가</span>
            </button>
          )}

          {/* 검색창 */}
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
                onClick={() => {
                  setShowSearch(false);
                  setSearchQuery('');
                }}
                className="w-full mt-2"
                size="sm"
              >
                취소
              </Button>
            </div>
          )}

          {/* 열외자 목록 */}
          {exceptions.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              추가된 열외자가 없습니다
            </div>
          ) : (
            <div className="space-y-2">
              {exceptions.map((ex) => (
                <div
                  key={ex.id}
                  className="p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <span className="font-semibold">{ex.name}</span>
                    <Select
                      value={ex.reason}
                      onValueChange={(value) => handleUpdateException(ex.id, value)}
                    >
                      <SelectTrigger className="w-32 h-8 text-xs">
                        <SelectValue placeholder="사유 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="휴가">휴가</SelectItem>
                        <SelectItem value="외출">외출</SelectItem>
                        <SelectItem value="병가">병가</SelectItem>
                        <SelectItem value="교육">교육</SelectItem>
                        <SelectItem value="출장">출장</SelectItem>
                        <SelectItem value="기타">기타</SelectItem>
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
              ))}
            </div>
          )}

          {/* 근무표 생성 버튼 */}
          <Button
            onClick={handleGenerateDuty}
            className="w-full mt-6 py-6 text-base"
            disabled={exceptions.length === 0}
          >
            근무표 생성하기
          </Button>
        </div>

        {/* 오른쪽: 근무표 */}
        <div className="w-1/2 bg-gray-50 p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">근무표</h2>

          {!dutyGenerated ? (
            <div className="flex flex-col items-center justify-center h-[calc(100%-3rem)] text-gray-400">
              <FileText className="h-16 w-16 mb-4 text-gray-300" />
              <p className="text-center">열외 입력 후 생성하세요</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <p className="text-gray-600">근무표가 생성되었습니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
