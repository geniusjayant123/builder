import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getCustomTimetable,
  addSubjectToDay,
  removeSubjectFromDay,
  getAllSubjects,
  createCustomSubject,
  type WeeklyTimetable,
  type CustomTimeSlot
} from "@/lib/attendance";
import { 
  Plus, 
  Trash2, 
  Calendar,
  Clock,
  BookOpen,
  Settings
} from "lucide-react";

interface TimetableManagerProps {
  onTimetableUpdate: () => void;
}

export default function TimetableManager({ onTimetableUpdate }: TimetableManagerProps) {
  const [timetable, setTimetable] = useState<WeeklyTimetable>({});
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [allSubjects, setAllSubjects] = useState(getAllSubjects());
  const [customSubjectName, setCustomSubjectName] = useState('');

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    setTimetable(getCustomTimetable());
    setAllSubjects(getAllSubjects());
  }, []);

  const handleCreateCustomSubject = () => {
    if (customSubjectName.trim()) {
      const newSubject = createCustomSubject(customSubjectName.trim());
      const updatedSubjects = getAllSubjects();
      setAllSubjects(updatedSubjects);
      setSelectedSubject(newSubject.id);
      setCustomSubjectName('');
    }
  };

  const handleAddSubject = () => {
    if (selectedDay && selectedSubject && startTime && endTime) {
      const updatedTimetable = addSubjectToDay(selectedDay, selectedSubject, startTime, endTime);
      setTimetable(updatedTimetable);
      setIsAddDialogOpen(false);
      setSelectedDay('');
      setSelectedSubject('');
      setStartTime('09:00');
      setEndTime('10:00');
      setAllSubjects(getAllSubjects()); // Refresh subjects list
      onTimetableUpdate();
    }
  };

  const handleRemoveSubject = (day: string, slotId: string) => {
    const updatedTimetable = removeSubjectFromDay(day, slotId);
    setTimetable(updatedTimetable);
    onTimetableUpdate();
  };

  const getSubjectById = (id: string) => {
    return allSubjects.find(s => s.id === id) || allSubjects[0];
  };

  const formatTime = (time: string) => {
    return new Date(`1970-01-01T${time}:00`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center gap-2">
            <Settings className="h-6 w-6" />
            Manage Timetable
          </CardTitle>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Add Subject
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add Subject to Timetable</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="day">Day</Label>
                  <Select value={selectedDay} onValueChange={setSelectedDay}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a day" />
                    </SelectTrigger>
                    <SelectContent>
                      {days.map(day => (
                        <SelectItem key={day} value={day}>{day}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {sampleSubjects.map(subject => (
                        <SelectItem key={subject.id} value={subject.id}>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: subject.color }}
                            />
                            {subject.name} ({subject.code})
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start-time">Start Time</Label>
                    <Input
                      id="start-time"
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end-time">End Time</Label>
                    <Input
                      id="end-time"
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleAddSubject}
                  className="w-full"
                  disabled={!selectedDay || !selectedSubject}
                >
                  Add to Timetable
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {days.map(day => (
            <div key={day} className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-lg">{day}</h3>
                <span className="text-sm text-gray-500">
                  ({(timetable[day] || []).length} subjects)
                </span>
              </div>
              
              {(timetable[day] || []).length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No subjects scheduled for {day}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {(timetable[day] || []).map((slot: CustomTimeSlot) => {
                    const subject = getSubjectById(slot.subjectId);
                    return (
                      <div 
                        key={slot.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                      >
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: subject.color }}
                          />
                          <div>
                            <p className="font-medium">{subject.name}</p>
                            <p className="text-sm text-gray-600">{subject.code}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Clock className="h-4 w-4" />
                            <span>
                              {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                            </span>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRemoveSubject(day, slot.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
