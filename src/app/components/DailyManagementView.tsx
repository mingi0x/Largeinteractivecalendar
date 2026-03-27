import { useState } from 'react';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface ExceptionPerson {
  id: string;
  name: string;
  rank: string;
  unit: string;
  reason: string;
}

interface DutyPerson {
  id: string;
  name: string;
  rank: string;
  position: string;
  time: string;
}

interface DailyManagementViewProps {
  selectedDate: Date;
  onBack: () => void;
}

export function DailyManagementView({ selectedDate, onBack }: DailyManagementViewProps) {
  // 열외 인원
  const [exceptions, setExceptions] = useState<ExceptionPerson[]>([]);
  const [exceptionForm, setExceptionForm] = useState({
    name: '',
    rank: '',
    unit: '',
    reason: '',
  });

  // 근무 인원
  const [duties, setDuties] = useState<DutyPerson[]>([]);
  const [dutyForm, setDutyForm] = useState({
    name: '',
    rank: '',
    position: '',
    time: '',
  });

  const formatDate = (date: Date) => {
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
  };

  const handleAddException = (e: React.FormEvent) => {
    e.preventDefault();
    const newException: ExceptionPerson = {
      id: Date.now().toString(),
      ...exceptionForm,
    };
    setExceptions([...exceptions, newException]);
    setExceptionForm({ name: '', rank: '', unit: '', reason: '' });
  };

  const handleRemoveException = (id: string) => {
    setExceptions(exceptions.filter((ex) => ex.id !== id));
  };

  const handleAddDuty = (e: React.FormEvent) => {
    e.preventDefault();
    const newDuty: DutyPerson = {
      id: Date.now().toString(),
      ...dutyForm,
    };
    setDuties([...duties, newDuty]);
    setDutyForm({ name: '', rank: '', position: '', time: '' });
  };

  const handleRemoveDuty = (id: string) => {
    setDuties(duties.filter((duty) => duty.id !== id));
  };

  return (
    <div className="w-full h-full flex flex-col bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm p-6 border-b">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <Button
            onClick={onBack}
            variant="outline"
            size="icon"
            className="h-10 w-10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">{formatDate(selectedDate)} 관리</h1>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 gap-6">
          {/* 왼쪽: 열외표 */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">열외표 등록</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddException} className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="ex-name">성명</Label>
                    <Input
                      id="ex-name"
                      value={exceptionForm.name}
                      onChange={(e) =>
                        setExceptionForm({ ...exceptionForm, name: e.target.value })
                      }
                      placeholder="성명을 입력하세요"
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="ex-rank">계급</Label>
                    <Input
                      id="ex-rank"
                      value={exceptionForm.rank}
                      onChange={(e) =>
                        setExceptionForm({ ...exceptionForm, rank: e.target.value })
                      }
                      placeholder="계급을 입력하세요"
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="ex-unit">소속</Label>
                    <Input
                      id="ex-unit"
                      value={exceptionForm.unit}
                      onChange={(e) =>
                        setExceptionForm({ ...exceptionForm, unit: e.target.value })
                      }
                      placeholder="소속 부대를 입력하세요"
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="ex-reason">열외 사유</Label>
                    <Textarea
                      id="ex-reason"
                      value={exceptionForm.reason}
                      onChange={(e) =>
                        setExceptionForm({ ...exceptionForm, reason: e.target.value })
                      }
                      placeholder="열외 사유를 입력하세요 (예: 휴가, 외출, 병가 등)"
                      className="min-h-[80px]"
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    열외 인원 추가
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* 열외 목록 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">열외 인원 목록</CardTitle>
              </CardHeader>
              <CardContent>
                {exceptions.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    등록된 열외 인원이 없습니다.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {exceptions.map((ex) => (
                      <div
                        key={ex.id}
                        className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex justify-between items-start"
                      >
                        <div className="flex-1">
                          <div className="font-semibold text-lg mb-1">
                            {ex.rank} {ex.name}
                          </div>
                          <div className="text-sm text-gray-600 mb-1">{ex.unit}</div>
                          <div className="text-sm text-gray-700">{ex.reason}</div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveException(ex.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 오른쪽: 근무표 */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">근무표 등록</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddDuty} className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="duty-name">성명</Label>
                    <Input
                      id="duty-name"
                      value={dutyForm.name}
                      onChange={(e) =>
                        setDutyForm({ ...dutyForm, name: e.target.value })
                      }
                      placeholder="성명을 입력하세요"
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="duty-rank">계급</Label>
                    <Input
                      id="duty-rank"
                      value={dutyForm.rank}
                      onChange={(e) =>
                        setDutyForm({ ...dutyForm, rank: e.target.value })
                      }
                      placeholder="계급을 입력하세요"
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="duty-position">근무 위치</Label>
                    <Input
                      id="duty-position"
                      value={dutyForm.position}
                      onChange={(e) =>
                        setDutyForm({ ...dutyForm, position: e.target.value })
                      }
                      placeholder="근무 위치를 입력하세요 (예: 정문, 후문, 초소 등)"
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="duty-time">근무 시간</Label>
                    <Input
                      id="duty-time"
                      value={dutyForm.time}
                      onChange={(e) =>
                        setDutyForm({ ...dutyForm, time: e.target.value })
                      }
                      placeholder="근무 시간을 입력하세요 (예: 09:00-18:00)"
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    근무 인원 추가
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* 근무 목록 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">근무 인원 목록</CardTitle>
              </CardHeader>
              <CardContent>
                {duties.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    등록된 근무 인원이 없습니다.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {duties.map((duty) => (
                      <div
                        key={duty.id}
                        className="bg-blue-50 p-4 rounded-lg border border-blue-200 flex justify-between items-start"
                      >
                        <div className="flex-1">
                          <div className="font-semibold text-lg mb-1">
                            {duty.rank} {duty.name}
                          </div>
                          <div className="text-sm text-gray-700 mb-1">
                            📍 {duty.position}
                          </div>
                          <div className="text-sm text-gray-600">🕐 {duty.time}</div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveDuty(duty.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
