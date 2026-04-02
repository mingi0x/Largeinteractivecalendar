import { ArrowLeft, FileText, ClipboardList } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useState } from 'react';

interface MonthlyManagementViewProps {
  year: number;
  month: number;
  onBack: () => void;
}

export function MonthlyManagementView({ year, month, onBack }: MonthlyManagementViewProps) {
  const [isLoading, setIsLoading] = useState(false);

  const DutySchedulePage = async () => {
    // 중복 클릭 방지
    if (isLoading) return;

    setIsLoading(true);
    
    try {
      const response = await fetch('https://humble-system-v6ww966q6jr92x9ww-8000.app.github.dev/api/generate-duty', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // 필요한 경우 데이터 전달
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('근무표 생성에 실패했습니다.');
      }

      const data = await response.json();

      if (data.status === "success") {
      // 2. 서버 작업이 성공하면 화면 상태를 변경
      alert("✅ 근무표가 성공적으로 생성되었습니다!");
    } else {
      alert("❌ 생성 실패: " + data.message);
    }
      
    } catch (error) {
      console.error('API Error:', error);
      alert('오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const CafeSchedulePage= async () => {
    // 중복 클릭 방지
    if (isLoading) return;

    setIsLoading(true);
    
    try {
      const response = await fetch('https://humble-system-v6ww966q6jr92x9ww-8000.app.github.dev/api/generate-cafe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // 필요한 경우 데이터 전달
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('근무표 생성에 실패했습니다.');
      }

      const data = await response.json();

      if (data.status === "success") {
      // 2. 서버 작업이 성공하면 화면 상태를 변경
      alert("✅ 근무표가 성공적으로 생성되었습니다!");
    } else {
      alert("❌ 생성 실패: " + data.message);
    }
      
    } catch (error) {
      console.error('API Error:', error);
      alert('오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="w-full h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* 헤더 */}
      <div className="bg-white shadow-sm p-6 border-b shrink-0">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <Button onClick={onBack} variant="outline" size="icon" className="h-10 w-10">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">{year}년 {month}월 관리</h1>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="flex-1 overflow-hidden flex flex-col p-6 gap-6">
        {/* 카드 영역 */}
        <div className="max-w-7xl w-full mx-auto flex-1 grid grid-cols-2 gap-6 overflow-hidden">

          {/* 특이사항 카드 */}
          <Card className="flex flex-col overflow-hidden">
            <CardHeader className="border-b pb-4 shrink-0">
              <CardTitle className="text-2xl">당직 근무표</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col items-center justify-center text-gray-400 p-0">
              <ClipboardList className="h-16 w-16 mb-4 text-gray-300" />
              <p className="text-center">특이사항 입력 후 생성하세요</p>
            </CardContent>
          </Card>

          {/* 식당 청소 인원 카드 */}
          <Card className="flex flex-col overflow-hidden">
            <CardHeader className="border-b pb-4 shrink-0">
              <CardTitle className="text-2xl">식당 청소 근무표</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col items-center justify-center text-gray-400 p-0">
              <FileText className="h-16 w-16 mb-4 text-gray-300" />
              <p className="text-center">특이사항 입력 후 생성하세요</p>
            </CardContent>
          </Card>
        </div>

        {/* 하단 버튼 */}
        <div className="max-w-7xl w-full mx-auto grid grid-cols-2 gap-6 shrink-0">
          <Button size="lg" onClick={DutySchedulePage} className="w-full h-14 text-base font-semibold">
            <FileText className="h-5 w-5 mr-2" />
            근무표 생성하기
          </Button>
          <Button size="lg" onClick={CafeSchedulePage} className="w-full h-14 text-base font-semibold">
            <FileText className="h-5 w-5 mr-2" />
            근무표 생성하기
          </Button>
        </div>
      </div>
    </div>
  );
}