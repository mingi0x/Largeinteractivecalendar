import { useState } from 'react';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface SpecialNote {
  id: string;
  date: string;
  content: string;
}

interface CleaningPerson {
  id: string;
  name: string;
  rank: string;
  date: string;
}

interface MonthlyManagementViewProps {
  year: number;
  month: number;
  onBack: () => void;
}

export function MonthlyManagementView({ year, month, onBack }: MonthlyManagementViewProps) {
  // 특이사항
  const [specialNotes, setSpecialNotes] = useState<SpecialNote[]>([]);
  const [noteForm, setNoteForm] = useState({
    date: '',
    content: '',
  });

  // 식당 청소 인원
  const [cleaningPersons, setCleaningPersons] = useState<CleaningPerson[]>([]);
  const [cleaningForm, setCleaningForm] = useState({
    name: '',
    rank: '',
    date: '',
  });

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    const newNote: SpecialNote = {
      id: Date.now().toString(),
      ...noteForm,
    };
    setSpecialNotes([...specialNotes, newNote]);
    setNoteForm({ date: '', content: '' });
  };

  const handleRemoveNote = (id: string) => {
    setSpecialNotes(specialNotes.filter((note) => note.id !== id));
  };

  const handleAddCleaning = (e: React.FormEvent) => {
    e.preventDefault();
    const newPerson: CleaningPerson = {
      id: Date.now().toString(),
      ...cleaningForm,
    };
    setCleaningPersons([...cleaningPersons, newPerson]);
    setCleaningForm({ name: '', rank: '', date: '' });
  };

  const handleRemoveCleaning = (id: string) => {
    setCleaningPersons(cleaningPersons.filter((person) => person.id !== id));
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
          <h1 className="text-3xl font-bold">{year}년 {month}월 관리</h1>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 gap-6">
          {/* 왼쪽: 특이사항 */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">특이사항 등록</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddNote} className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="note-date">날짜</Label>
                    <Input
                      id="note-date"
                      type="date"
                      value={noteForm.date}
                      onChange={(e) =>
                        setNoteForm({ ...noteForm, date: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="note-content">내용</Label>
                    <Textarea
                      id="note-content"
                      value={noteForm.content}
                      onChange={(e) =>
                        setNoteForm({ ...noteForm, content: e.target.value })
                      }
                      placeholder="특이사항을 입력하세요"
                      className="min-h-[120px]"
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    특이사항 추가
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* 특이사항 목록 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">특이사항 목록</CardTitle>
              </CardHeader>
              <CardContent>
                {specialNotes.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    등록된 특이사항이 없습니다.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {specialNotes
                      .sort((a, b) => a.date.localeCompare(b.date))
                      .map((note) => (
                        <div
                          key={note.id}
                          className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 flex justify-between items-start"
                        >
                          <div className="flex-1">
                            <div className="font-semibold text-lg mb-2 text-yellow-900">
                              📅 {note.date}
                            </div>
                            <div className="text-gray-700 whitespace-pre-wrap">
                              {note.content}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveNote(note.id)}
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

          {/* 오른쪽: 식당 청소 인원 */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">식당 청소 인원 등록</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddCleaning} className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="cleaning-date">날짜</Label>
                    <Input
                      id="cleaning-date"
                      type="date"
                      value={cleaningForm.date}
                      onChange={(e) =>
                        setCleaningForm({ ...cleaningForm, date: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="cleaning-name">성명</Label>
                    <Input
                      id="cleaning-name"
                      value={cleaningForm.name}
                      onChange={(e) =>
                        setCleaningForm({ ...cleaningForm, name: e.target.value })
                      }
                      placeholder="성명을 입력하세요"
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="cleaning-rank">계급</Label>
                    <Input
                      id="cleaning-rank"
                      value={cleaningForm.rank}
                      onChange={(e) =>
                        setCleaningForm({ ...cleaningForm, rank: e.target.value })
                      }
                      placeholder="계급을 입력하세요"
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    청소 인원 추가
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* 청소 인원 목록 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">식당 청소 인원 목록</CardTitle>
              </CardHeader>
              <CardContent>
                {cleaningPersons.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    등록된 청소 인원이 없습니다.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {cleaningPersons
                      .sort((a, b) => a.date.localeCompare(b.date))
                      .map((person) => (
                        <div
                          key={person.id}
                          className="bg-green-50 p-4 rounded-lg border border-green-200 flex justify-between items-start"
                        >
                          <div className="flex-1">
                            <div className="font-semibold text-lg mb-1">
                              {person.rank} {person.name}
                            </div>
                            <div className="text-sm text-gray-600">
                              📅 {person.date}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveCleaning(person.id)}
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
