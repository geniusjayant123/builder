import { useState } from "react";
import { Calendar as CalendarIcon, Check, X, Edit3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getClassesForDate,
  getAttendanceForDateAndSubject,
  editAttendance,
  getAllSubjects,
  type TimeSlot,
  type AttendanceRecord
} from "@/lib/attendance";

interface DatePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export default function DatePicker({ isOpen, onClose, onSave }: DatePickerProps) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [classes, setClasses] = useState<TimeSlot[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    const dayClasses = getClassesForDate(date);
    const dayAttendance = getAttendanceForDateAndSubject(date);
    setClasses(dayClasses);
    setAttendanceRecords(dayAttendance);
  };

  const handleAttendanceEdit = (subjectId: string, status: 'present' | 'absent') => {
    editAttendance(subjectId, selectedDate, status);
    const updatedAttendance = getAttendanceForDateAndSubject(selectedDate);
    setAttendanceRecords(updatedAttendance);
  };

  const getAttendanceStatus = (subjectId: string) => {
    return attendanceRecords.find(r => r.subjectId === subjectId);
  };

  const formatTime = (time: string) => {
    return new Date(`1970-01-01T${time}:00`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Edit Historical Attendance
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Date Selection */}
          <div className="space-y-2">
            <Label htmlFor="date">Select Date</Label>
            <Input
              id="date"
              type="date"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              max={new Date().toISOString().split('T')[0]} // Can't select future dates
            />
            <p className="text-sm text-gray-600">
              {formatDate(selectedDate)}
            </p>
          </div>

          {/* Classes for Selected Date */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Classes on this date:</h3>
            
            {classes.length === 0 ? (
              <Card className="p-6 text-center">
                <div className="text-gray-500">
                  <CalendarIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No classes scheduled for this day</p>
                </div>
              </Card>
            ) : (
              <div className="space-y-3">
                {classes.map((classItem) => {
                  const attendanceRecord = getAttendanceStatus(classItem.subject.id);
                  
                  return (
                    <Card key={classItem.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-16 rounded-full"
                            style={{ backgroundColor: classItem.subject.color }}
                          />
                          <div>
                            <h4 className="font-medium">{classItem.subject.name}</h4>
                            <p className="text-sm text-gray-600">{classItem.subject.code}</p>
                            <p className="text-sm text-gray-500">
                              {formatTime(classItem.startTime)} - {formatTime(classItem.endTime)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {attendanceRecord ? (
                            <div className="flex items-center gap-2">
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                attendanceRecord.status === 'present' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {attendanceRecord.status === 'present' ? 'Present' : 'Absent'}
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAttendanceEdit(
                                  classItem.subject.id, 
                                  attendanceRecord.status === 'present' ? 'absent' : 'present'
                                )}
                              >
                                <Edit3 className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => handleAttendanceEdit(classItem.subject.id, 'present')}
                              >
                                <Check className="h-4 w-4 mr-1" />
                                Present
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleAttendanceEdit(classItem.subject.id, 'absent')}
                              >
                                <X className="h-4 w-4 mr-1" />
                                Absent
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={() => { onSave(); onClose(); }}>
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
