export interface Subject {
  id: string;
  name: string;
  code: string;
  color: string;
}

export interface TimeSlot {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  subject: Subject;
}

export interface CustomTimeSlot {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  subjectId: string;
}

export interface WeeklyTimetable {
  [day: string]: CustomTimeSlot[];
}

export interface AttendanceRecord {
  id: string;
  subjectId: string;
  date: string;
  status: 'present' | 'absent' | 'pending';
  markedAt?: string;
}

export interface AttendanceStats {
  totalLectures: number;
  attendedLectures: number;
  percentage: number;
  subjectStats: Record<string, {
    total: number;
    attended: number;
    percentage: number;
  }>;
}

// Sample data for demonstration
export const sampleSubjects: Subject[] = [
  { id: '1', name: 'Mathematics', code: 'MATH101', color: '#3B82F6' },
  { id: '2', name: 'Physics', code: 'PHY101', color: '#EF4444' },
  { id: '3', name: 'Chemistry', code: 'CHE101', color: '#8B5CF6' },
  { id: '4', name: 'Computer Science', code: 'CS101', color: '#10B981' },
  { id: '5', name: 'English', code: 'ENG101', color: '#F59E0B' },
];

export const sampleTimetable: TimeSlot[] = [
  { id: '1', day: 'Monday', startTime: '09:00', endTime: '10:00', subject: sampleSubjects[0] },
  { id: '2', day: 'Monday', startTime: '10:00', endTime: '11:00', subject: sampleSubjects[1] },
  { id: '3', day: 'Monday', startTime: '11:30', endTime: '12:30', subject: sampleSubjects[2] },
  { id: '4', day: 'Tuesday', startTime: '09:00', endTime: '10:00', subject: sampleSubjects[3] },
  { id: '5', day: 'Tuesday', startTime: '10:00', endTime: '11:00', subject: sampleSubjects[4] },
  { id: '6', day: 'Tuesday', startTime: '11:30', endTime: '12:30', subject: sampleSubjects[0] },
  { id: '7', day: 'Wednesday', startTime: '09:00', endTime: '10:00', subject: sampleSubjects[1] },
  { id: '8', day: 'Wednesday', startTime: '10:00', endTime: '11:00', subject: sampleSubjects[2] },
  { id: '9', day: 'Thursday', startTime: '09:00', endTime: '10:00', subject: sampleSubjects[3] },
  { id: '10', day: 'Thursday', startTime: '10:00', endTime: '11:00', subject: sampleSubjects[4] },
  { id: '11', day: 'Friday', startTime: '09:00', endTime: '10:00', subject: sampleSubjects[0] },
  { id: '12', day: 'Friday', startTime: '10:00', endTime: '11:00', subject: sampleSubjects[1] },
];

export const getAttendanceData = (): AttendanceRecord[] => {
  const stored = localStorage.getItem('attendanceRecords');
  return stored ? JSON.parse(stored) : [];
};

export const saveAttendanceData = (records: AttendanceRecord[]) => {
  localStorage.setItem('attendanceRecords', JSON.stringify(records));
};

export const markAttendance = (subjectId: string, date: string, status: 'present' | 'absent') => {
  const records = getAttendanceData();
  const existingRecord = records.find(r => r.subjectId === subjectId && r.date === date);
  
  if (existingRecord) {
    existingRecord.status = status;
    existingRecord.markedAt = new Date().toISOString();
  } else {
    const newRecord: AttendanceRecord = {
      id: `${subjectId}-${date}`,
      subjectId,
      date,
      status,
      markedAt: new Date().toISOString(),
    };
    records.push(newRecord);
  }
  
  saveAttendanceData(records);
  return records;
};

export const calculateAttendanceStats = (): AttendanceStats => {
  const records = getAttendanceData();
  const subjectStats: Record<string, { total: number; attended: number; percentage: number }> = {};
  
  // Calculate stats for each subject
  sampleSubjects.forEach(subject => {
    const subjectRecords = records.filter(r => r.subjectId === subject.id);
    const total = subjectRecords.length;
    const attended = subjectRecords.filter(r => r.status === 'present').length;
    const percentage = total > 0 ? Math.round((attended / total) * 100) : 0;
    
    subjectStats[subject.id] = { total, attended, percentage };
  });
  
  // Calculate overall stats
  const totalLectures = records.length;
  const attendedLectures = records.filter(r => r.status === 'present').length;
  const percentage = totalLectures > 0 ? Math.round((attendedLectures / totalLectures) * 100) : 0;
  
  return {
    totalLectures,
    attendedLectures,
    percentage,
    subjectStats,
  };
};

export const getTodaysClasses = (): TimeSlot[] => {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  return sampleTimetable.filter(slot => slot.day === today);
};

export const getAttendanceForDate = (subjectId: string, date: string): AttendanceRecord | undefined => {
  const records = getAttendanceData();
  return records.find(r => r.subjectId === subjectId && r.date === date);
};

export const autoMarkAbsent = () => {
  const records = getAttendanceData();
  const today = new Date().toISOString().split('T')[0];
  const currentTime = new Date();
  const currentTimeString = currentTime.toTimeString().slice(0, 5); // HH:MM format

  // Get today's classes that have ended but aren't marked
  const todaysClasses = getTodaysClasses();
  let hasNewAbsents = false;

  todaysClasses.forEach(classItem => {
    const classEndTime = classItem.endTime;
    const existingRecord = records.find(r => r.subjectId === classItem.subject.id && r.date === today);

    // Check if class has ended (add 5 minute buffer)
    const classEnd = new Date(`${today}T${classEndTime}:00`);
    classEnd.setMinutes(classEnd.getMinutes() + 5); // 5 minute grace period

    if (currentTime > classEnd && !existingRecord) {
      // Auto-mark as absent
      const newRecord: AttendanceRecord = {
        id: `${classItem.subject.id}-${today}`,
        subjectId: classItem.subject.id,
        date: today,
        status: 'absent',
        markedAt: new Date().toISOString(),
      };
      records.push(newRecord);
      hasNewAbsents = true;
    }
  });

  if (hasNewAbsents) {
    saveAttendanceData(records);
  }

  return hasNewAbsents;
};

export const initializeSampleData = () => {
  const existingRecords = getAttendanceData();
  if (existingRecords.length === 0) {
    // Add some sample attendance records for demo
    const sampleRecords: AttendanceRecord[] = [
      { id: '1-2024-01-15', subjectId: '1', date: '2024-01-15', status: 'present', markedAt: '2024-01-15T09:00:00Z' },
      { id: '2-2024-01-15', subjectId: '2', date: '2024-01-15', status: 'present', markedAt: '2024-01-15T10:00:00Z' },
      { id: '3-2024-01-15', subjectId: '3', date: '2024-01-15', status: 'absent', markedAt: '2024-01-15T11:30:00Z' },
      { id: '1-2024-01-16', subjectId: '1', date: '2024-01-16', status: 'present', markedAt: '2024-01-16T09:00:00Z' },
      { id: '2-2024-01-16', subjectId: '2', date: '2024-01-16', status: 'absent', markedAt: '2024-01-16T10:00:00Z' },
      { id: '4-2024-01-17', subjectId: '4', date: '2024-01-17', status: 'present', markedAt: '2024-01-17T09:00:00Z' },
      { id: '5-2024-01-17', subjectId: '5', date: '2024-01-17', status: 'present', markedAt: '2024-01-17T10:00:00Z' },
    ];
    saveAttendanceData(sampleRecords);
  }
};
