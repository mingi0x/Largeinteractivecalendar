import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';

interface ExceptionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: Date | null;
}

export function ExceptionFormDialog({
  open,
  onOpenChange,
  selectedDate,
}: ExceptionFormDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    rank: '',
    unit: '',
    reason: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 열외표 데이터 처리
    console.log('열외표 제출:', {
      date: selectedDate,
      ...formData,
    });

    // 폼 초기화
    setFormData({
      name: '',
      rank: '',
      unit: '',
      reason: '',
    });

    // 다이얼로그 닫기
    onOpenChange(false);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">열외표 입력</DialogTitle>
          <DialogDescription>
            {selectedDate && formatDate(selectedDate)} 열외 인원을 등록합니다.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">성명</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="성명을 입력하세요"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="rank">계급</Label>
              <Input
                id="rank"
                value={formData.rank}
                onChange={(e) =>
                  setFormData({ ...formData, rank: e.target.value })
                }
                placeholder="계급을 입력하세요"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="unit">소속</Label>
              <Input
                id="unit"
                value={formData.unit}
                onChange={(e) =>
                  setFormData({ ...formData, unit: e.target.value })
                }
                placeholder="소속 부대를 입력하세요"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="reason">열외 사유</Label>
              <Textarea
                id="reason"
                value={formData.reason}
                onChange={(e) =>
                  setFormData({ ...formData, reason: e.target.value })
                }
                placeholder="열외 사유를 입력하세요 (예: 휴가, 외출, 병가 등)"
                className="min-h-[100px]"
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              취소
            </Button>
            <Button type="submit">등록</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
