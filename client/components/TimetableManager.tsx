import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  removeCustomSubject,
  type WeeklyTimetable,
  type CustomTimeSlot,
} from "@/lib/attendance";
import {
  Plus,
  Trash2,
  Calendar,
  Clock,
  BookOpen,
  Settings,
} from "lucide-react";

interface TimetableManagerProps {
  onTimetableUpdate: () => void;
}

export default function TimetableManager({
  onTimetableUpdate,
}: TimetableManagerProps) {
  const [timetable, setTimetable] = useState<WeeklyTimetable>({});
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [allSubjects, setAllSubjects] = useState(getAllSubjects());
  const [customSubjectName, setCustomSubjectName] = useState("");

  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

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
      setCustomSubjectName("");
    }
  };

  const handleAddSubject = () => {
    if (selectedDay && selectedSubject && startTime && endTime) {
      const updatedTimetable = addSubjectToDay(
        selectedDay,
        selectedSubject,
        startTime,
        endTime,
      );
      setTimetable(updatedTimetable);
      setIsAddDialogOpen(false);
      setSelectedDay("");
      setSelectedSubject("");
      setStartTime("09:00");
      setEndTime("10:00");
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
    return allSubjects.find((s) => s.id === id) || allSubjects[0];
  };

  const formatTime = (time: string) => {
    return new Date(`1970-01-01T${time}:00`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Manage Timetable
          </CardTitle>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 text-sm h-8">
                <Plus className="h-3 w-3 mr-1" />
                Add
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm mx-2">
              <DialogHeader>
                <DialogTitle>Add Subject to Timetable</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 py-3">
                <div className="space-y-1">
                  <Label htmlFor="day" className="text-sm">Day</Label>
                  <Select value={selectedDay} onValueChange={setSelectedDay}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Select a day" />
                    </SelectTrigger>
                    <SelectContent>
                      {days.map((day) => (
                        <SelectItem key={day} value={day}>
                          {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="subject" className="text-sm">Subject</Label>
                  <Select
                    value={selectedSubject}
                    onValueChange={setSelectedSubject}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Select a subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {allSubjects.map((subject) => (
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

                <div className="space-y-1">
                  <Label htmlFor="custom-subject" className="text-sm">Or Create New Subject</Label>
                  <div className="flex gap-2">
                    <Input
                      id="custom-subject"
                      className="h-9"
                      placeholder="Enter subject name"
                      value={customSubjectName}
                      onChange={(e) => setCustomSubjectName(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          handleCreateCustomSubject();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-9 px-3 text-xs"
                      onClick={handleCreateCustomSubject}
                      disabled={!customSubjectName.trim()}
                    >
                      Create
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="start-time" className="text-sm">Start Time</Label>
                    <Input
                      id="start-time"
                      type="time"
                      className="h-9"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="end-time" className="text-sm">End Time</Label>
                    <Input
                      id="end-time"
                      type="time"
                      className="h-9"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                    />
                  </div>
                </div>

                <Button
                  onClick={handleAddSubject}
                  className="w-full h-9 text-sm"
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
        <div className="space-y-3">
          {days.map((day) => (
            <div key={day} className="border rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-base">{day}</h3>
                <span className="text-xs text-gray-500">
                  ({(timetable[day] || []).length})
                </span>
              </div>

              {(timetable[day] || []).length === 0 ? (
                <div className="text-center py-4 text-gray-500 text-sm">
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
                            <p className="text-sm text-gray-600">
                              {subject.code}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Clock className="h-4 w-4" />
                            <span>
                              {formatTime(slot.startTime)} -{" "}
                              {formatTime(slot.endTime)}
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
