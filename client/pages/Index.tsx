import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import TimetableManager from "@/components/TimetableManager";
import {
  calculateAttendanceStats,
  getTodaysClasses,
  markAttendance,
  getAttendanceForDate,
  initializeSampleData,
  autoMarkAbsent,
  undoAttendance,
  getAllSubjects,
  removeCustomSubject,
  removeAnySubject,
  editAttendance,
  type AttendanceStats,
  type TimeSlot,
} from "@/lib/attendance";
import DatePicker from "@/components/DatePicker";
import {
  Calendar,
  TrendingUp,
  BookOpen,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  GraduationCap,
  Settings,
  RotateCcw,
  Trash2,
  Edit3,
  CalendarDays,
} from "lucide-react";

export default function Index() {
  const [stats, setStats] = useState<AttendanceStats>({
    totalLectures: 0,
    attendedLectures: 0,
    percentage: 0,
    subjectStats: {},
  });
  const [todaysClasses, setTodaysClasses] = useState<TimeSlot[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showTimetableManager, setShowTimetableManager] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    initializeSampleData();
    refreshData();

    // Update current time and check for auto-absent every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      const hasNewAbsents = autoMarkAbsent();
      if (hasNewAbsents) {
        refreshData();
      }
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const refreshData = () => {
    setStats(calculateAttendanceStats());
    setTodaysClasses(getTodaysClasses());
  };

  const handleMarkAttendance = (
    subjectId: string,
    status: "present" | "absent",
  ) => {
    const today = new Date().toISOString().split("T")[0];
    markAttendance(subjectId, today, status);
    refreshData();
  };

  const handleUndoAttendance = (subjectId: string) => {
    const today = new Date().toISOString().split("T")[0];
    undoAttendance(subjectId, today);
    refreshData();
  };

  const handleRemoveSubject = (subjectId: string) => {
    const subject = getAllSubjects().find(s => s.id === subjectId);
    if (subject && confirm(`Are you sure you want to remove "${subject.name}"? This will delete all attendance records for this subject.`)) {
      removeCustomSubject(subjectId);
      refreshData();
    }
  };

  const handleEditAttendance = (subjectId: string, date: string, status: 'present' | 'absent') => {
    editAttendance(subjectId, date, status);
    refreshData();
  };

  const getStatusColor = (percentage: number) => {
    if (percentage >= 85) return "text-success";
    if (percentage >= 75) return "text-warning";
    return "text-destructive";
  };

  const getStatusBg = (percentage: number) => {
    if (percentage >= 85) return "bg-success/10 border-success/20";
    if (percentage >= 75) return "bg-warning/10 border-warning/20";
    return "bg-destructive/10 border-destructive/20";
  };

  const formatTime = (time: string) => {
    return new Date(`1970-01-01T${time}:00`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const isClassActive = (startTime: string, endTime: string) => {
    const now = currentTime;
    const start = new Date(`${now.toDateString()} ${startTime}:00`);
    const end = new Date(`${now.toDateString()} ${endTime}:00`);
    return now >= start && now <= end;
  };

  const getAttendanceStatus = (subjectId: string) => {
    const today = new Date().toISOString().split("T")[0];
    return getAttendanceForDate(subjectId, today);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 overflow-x-hidden">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-3 py-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-xl">
                <GraduationCap className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  AttendanceTracker
                </h1>
                <p className="text-sm text-gray-600">
                  Track your academic progress
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant="outline"
                onClick={() => setShowTimetableManager(!showTimetableManager)}
                className="flex items-center gap-1 text-xs sm:text-sm"
                size="sm"
              >
                <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">{showTimetableManager ? "Hide" : "Manage"}</span>
                <span className="sm:hidden">Manage</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowDatePicker(true)}
                className="flex items-center gap-1 text-xs sm:text-sm"
                size="sm"
              >
                <CalendarDays className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Edit History</span>
                <span className="sm:hidden">History</span>
              </Button>
              <div
                className="text-right cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                onClick={() => setShowDatePicker(true)}
                title="Click to edit historical attendance"
              >
                <p className="text-sm text-gray-600">Today</p>
                <p className="font-semibold text-gray-900 flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {currentTime.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-3 py-4 space-y-4 sm:px-4 sm:py-6 sm:space-y-6">
        {/* Timetable Manager */}
        {showTimetableManager && (
          <TimetableManager onTimetableUpdate={refreshData} />
        )}
        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {/* Overall Attendance */}
          <Card className={`border-2 ${getStatusBg(stats.percentage)}`}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Overall Attendance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div
                  className={`text-4xl font-bold ${getStatusColor(stats.percentage)}`}
                >
                  {stats.percentage}%
                </div>
                <Progress value={stats.percentage} className="mt-3 h-2" />
                <p className="text-sm text-gray-600 mt-2">
                  {stats.attendedLectures} of {stats.totalLectures} lectures
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Total Lectures */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Total Lectures
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600">
                  {stats.totalLectures}
                </div>
                <p className="text-sm text-gray-600 mt-1">Classes attended</p>
              </div>
            </CardContent>
          </Card>

          {/* Attended */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Attended
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-4xl font-bold text-success">
                  {stats.attendedLectures}
                </div>
                <p className="text-sm text-gray-600 mt-1">Present in class</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Today's Classes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Calendar className="h-6 w-6" />
              Today's Classes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todaysClasses.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No classes scheduled for today</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todaysClasses.map((classItem) => {
                  const attendanceRecord = getAttendanceStatus(
                    classItem.subject.id,
                  );
                  const isActive = isClassActive(
                    classItem.startTime,
                    classItem.endTime,
                  );

                  return (
                    <div
                      key={classItem.id}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        isActive
                          ? "bg-blue-50 border-blue-200 shadow-md"
                          : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div
                            className="w-4 h-16 rounded-full"
                            style={{ backgroundColor: classItem.subject.color }}
                          />
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {classItem.subject.name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {classItem.subject.code}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Clock className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-600">
                                {formatTime(classItem.startTime)} -{" "}
                                {formatTime(classItem.endTime)}
                              </span>
                              {isActive && (
                                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                                  Live Now
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {attendanceRecord ? (
                            <div className="flex items-center gap-3">
                              <div className="text-center">
                                <div
                                  className={`flex items-center gap-1 ${
                                    attendanceRecord.status === "present"
                                      ? "text-success"
                                      : "text-destructive"
                                  }`}
                                >
                                  {attendanceRecord.status === "present" ? (
                                    <CheckCircle className="h-5 w-5" />
                                  ) : (
                                    <XCircle className="h-5 w-5" />
                                  )}
                                  <span className="font-medium capitalize">
                                    {attendanceRecord.status}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                  Marked
                                </p>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleUndoAttendance(classItem.subject.id)
                                }
                                className="text-gray-600 hover:text-gray-800"
                              >
                                <RotateCcw className="h-4 w-4 mr-1" />
                                Undo
                              </Button>
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                className="bg-success hover:bg-success/90"
                                onClick={() =>
                                  handleMarkAttendance(
                                    classItem.subject.id,
                                    "present",
                                  )
                                }
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Present
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() =>
                                  handleMarkAttendance(
                                    classItem.subject.id,
                                    "absent",
                                  )
                                }
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Absent
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Subject-wise Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <TrendingUp className="h-6 w-6" />
              Subject-wise Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {Object.entries(stats.subjectStats).map(
                ([subjectId, subjectStat]) => {
                  const allSubjects = getAllSubjects();
                  const subject = allSubjects.find((s) => s.id === subjectId);

                  if (!subject) return null;

                  return (
                    <div
                      key={subjectId}
                      className="p-4 rounded-lg border-2 bg-white"
                      style={{ borderColor: `${subject.color}20` }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: subject.color }}
                          />
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {subject.name}
                            </h4>
                            <p className="text-xs text-gray-600">
                              {subject.code}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveSubject(subject.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 h-6 w-6 p-0"
                          title={`Remove ${subject.name} subject`}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="text-center">
                        <div
                          className={`text-2xl font-bold ${getStatusColor(subjectStat.percentage)}`}
                        >
                          {subjectStat.percentage}%
                        </div>
                        <Progress
                          value={subjectStat.percentage}
                          className="mt-2 h-1.5"
                        />
                        <p className="text-sm text-gray-600 mt-2">
                          {subjectStat.attended} / {subjectStat.total} classes
                        </p>
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Date Picker Modal */}
      <DatePicker
        isOpen={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onSave={refreshData}
      />
    </div>
  );
}
