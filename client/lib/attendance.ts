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
  status: "present" | "absent" | "pending";
  markedAt?: string;
}

export interface AttendanceStats {
  totalLectures: number;
  attendedLectures: number;
  percentage: number;
  subjectStats: Record<
    string,
    {
      total: number;
      attended: number;
      percentage: number;
    }
  >;
}

// Default subjects
const defaultSubjects: Subject[] = [
  { id: "1", name: "Mathematics", code: "MATH101", color: "#3B82F6" },
  { id: "2", name: "Physics", code: "PHY101", color: "#EF4444" },
  { id: "3", name: "Chemistry", code: "CHE101", color: "#8B5CF6" },
  { id: "4", name: "Computer Science", code: "CS101", color: "#10B981" },
  { id: "5", name: "English", code: "ENG101", color: "#F59E0B" },
];

// Color palette for custom subjects
const subjectColors = [
  "#3B82F6",
  "#EF4444",
  "#8B5CF6",
  "#10B981",
  "#F59E0B",
  "#EC4899",
  "#6366F1",
  "#14B8A6",
  "#F97316",
  "#84CC16",
  "#8B5A2B",
  "#DC2626",
  "#7C3AED",
  "#059669",
  "#D97706",
];

export const getCustomSubjects = (): Subject[] => {
  const stored = localStorage.getItem("customSubjects");
  return stored ? JSON.parse(stored) : [];
};

export const saveCustomSubjects = (subjects: Subject[]) => {
  localStorage.setItem("customSubjects", JSON.stringify(subjects));
};

export const getAllSubjects = (): Subject[] => {
  return [...defaultSubjects, ...getCustomSubjects()];
};

// For backward compatibility
export const sampleSubjects = getAllSubjects();

export const sampleTimetable: TimeSlot[] = [
  {
    id: "1",
    day: "Monday",
    startTime: "09:00",
    endTime: "10:00",
    subject: sampleSubjects[0],
  },
  {
    id: "2",
    day: "Monday",
    startTime: "10:00",
    endTime: "11:00",
    subject: sampleSubjects[1],
  },
  {
    id: "3",
    day: "Monday",
    startTime: "11:30",
    endTime: "12:30",
    subject: sampleSubjects[2],
  },
  {
    id: "4",
    day: "Tuesday",
    startTime: "09:00",
    endTime: "10:00",
    subject: sampleSubjects[3],
  },
  {
    id: "5",
    day: "Tuesday",
    startTime: "10:00",
    endTime: "11:00",
    subject: sampleSubjects[4],
  },
  {
    id: "6",
    day: "Tuesday",
    startTime: "11:30",
    endTime: "12:30",
    subject: sampleSubjects[0],
  },
  {
    id: "7",
    day: "Wednesday",
    startTime: "09:00",
    endTime: "10:00",
    subject: sampleSubjects[1],
  },
  {
    id: "8",
    day: "Wednesday",
    startTime: "10:00",
    endTime: "11:00",
    subject: sampleSubjects[2],
  },
  {
    id: "9",
    day: "Thursday",
    startTime: "09:00",
    endTime: "10:00",
    subject: sampleSubjects[3],
  },
  {
    id: "10",
    day: "Thursday",
    startTime: "10:00",
    endTime: "11:00",
    subject: sampleSubjects[4],
  },
  {
    id: "11",
    day: "Friday",
    startTime: "09:00",
    endTime: "10:00",
    subject: sampleSubjects[0],
  },
  {
    id: "12",
    day: "Friday",
    startTime: "10:00",
    endTime: "11:00",
    subject: sampleSubjects[1],
  },
];

export const getAttendanceData = (): AttendanceRecord[] => {
  const stored = localStorage.getItem("attendanceRecords");
  return stored ? JSON.parse(stored) : [];
};

export const saveAttendanceData = (records: AttendanceRecord[]) => {
  localStorage.setItem("attendanceRecords", JSON.stringify(records));
};

export const markAttendance = (
  subjectId: string,
  date: string,
  status: "present" | "absent",
) => {
  const records = getAttendanceData();
  const existingRecord = records.find(
    (r) => r.subjectId === subjectId && r.date === date,
  );

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
  const subjectStats: Record<
    string,
    { total: number; attended: number; percentage: number }
  > = {};
  const allSubjects = getAllSubjects();

  // Calculate stats for each subject
  allSubjects.forEach((subject) => {
    const subjectRecords = records.filter((r) => r.subjectId === subject.id);
    const total = subjectRecords.length;
    const attended = subjectRecords.filter(
      (r) => r.status === "present",
    ).length;
    const percentage = total > 0 ? Math.round((attended / total) * 100) : 0;

    subjectStats[subject.id] = { total, attended, percentage };
  });

  // Calculate overall stats
  const totalLectures = records.length;
  const attendedLectures = records.filter((r) => r.status === "present").length;
  const percentage =
    totalLectures > 0
      ? Math.round((attendedLectures / totalLectures) * 100)
      : 0;

  return {
    totalLectures,
    attendedLectures,
    percentage,
    subjectStats,
  };
};

export const getTodaysClasses = (): TimeSlot[] => {
  const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const customTimetable = getCustomTimetable();
  const todaysSlots = customTimetable[today] || [];
  const allSubjects = getAllSubjects();

  return todaysSlots.map((slot) => {
    const subject = allSubjects.find((s) => s.id === slot.subjectId);
    return {
      id: slot.id,
      day: slot.day,
      startTime: slot.startTime,
      endTime: slot.endTime,
      subject: subject || allSubjects[0], // fallback to first subject
    };
  });
};

export const getAttendanceForDate = (
  subjectId: string,
  date: string,
): AttendanceRecord | undefined => {
  const records = getAttendanceData();
  return records.find((r) => r.subjectId === subjectId && r.date === date);
};

export const autoMarkAbsent = () => {
  const records = getAttendanceData();
  const today = new Date().toISOString().split("T")[0];
  const currentTime = new Date();

  // Get today's classes that have ended but aren't marked
  const todaysClasses = getTodaysClasses();
  let hasNewAbsents = false;

  todaysClasses.forEach((classItem) => {
    const classEndTime = classItem.endTime;
    const existingRecord = records.find(
      (r) => r.subjectId === classItem.subject.id && r.date === today,
    );

    // Check if class has ended (add 5 minute buffer)
    const classEnd = new Date(`${today}T${classEndTime}:00`);
    classEnd.setMinutes(classEnd.getMinutes() + 5); // 5 minute grace period

    if (currentTime > classEnd && !existingRecord) {
      // Auto-mark as absent
      const newRecord: AttendanceRecord = {
        id: `${classItem.subject.id}-${today}`,
        subjectId: classItem.subject.id,
        date: today,
        status: "absent",
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

// Custom timetable management
export const getCustomTimetable = (): WeeklyTimetable => {
  const stored = localStorage.getItem("customTimetable");
  if (stored) {
    return JSON.parse(stored);
  }

  // Default timetable based on sample data
  return {
    Monday: [
      {
        id: "mon-1",
        day: "Monday",
        startTime: "09:00",
        endTime: "10:00",
        subjectId: "1",
      },
      {
        id: "mon-2",
        day: "Monday",
        startTime: "10:00",
        endTime: "11:00",
        subjectId: "2",
      },
    ],
    Tuesday: [
      {
        id: "tue-1",
        day: "Tuesday",
        startTime: "09:00",
        endTime: "10:00",
        subjectId: "3",
      },
      {
        id: "tue-2",
        day: "Tuesday",
        startTime: "10:00",
        endTime: "11:00",
        subjectId: "4",
      },
    ],
    Wednesday: [
      {
        id: "wed-1",
        day: "Wednesday",
        startTime: "09:00",
        endTime: "10:00",
        subjectId: "1",
      },
      {
        id: "wed-2",
        day: "Wednesday",
        startTime: "10:00",
        endTime: "11:00",
        subjectId: "5",
      },
    ],
    Thursday: [
      {
        id: "thu-1",
        day: "Thursday",
        startTime: "09:00",
        endTime: "10:00",
        subjectId: "2",
      },
      {
        id: "thu-2",
        day: "Thursday",
        startTime: "10:00",
        endTime: "11:00",
        subjectId: "3",
      },
    ],
    Friday: [
      {
        id: "fri-1",
        day: "Friday",
        startTime: "09:00",
        endTime: "10:00",
        subjectId: "4",
      },
      {
        id: "fri-2",
        day: "Friday",
        startTime: "10:00",
        endTime: "11:00",
        subjectId: "5",
      },
    ],
    Saturday: [],
    Sunday: [],
  };
};

export const saveCustomTimetable = (timetable: WeeklyTimetable) => {
  localStorage.setItem("customTimetable", JSON.stringify(timetable));
};

export const addSubjectToDay = (
  day: string,
  subjectId: string,
  startTime: string,
  endTime: string,
) => {
  const timetable = getCustomTimetable();
  const newSlot: CustomTimeSlot = {
    id: `${day.toLowerCase()}-${Date.now()}`,
    day,
    startTime,
    endTime,
    subjectId,
  };

  if (!timetable[day]) {
    timetable[day] = [];
  }

  timetable[day].push(newSlot);
  timetable[day].sort((a, b) => a.startTime.localeCompare(b.startTime));

  saveCustomTimetable(timetable);
  return timetable;
};

export const removeSubjectFromDay = (day: string, slotId: string) => {
  const timetable = getCustomTimetable();
  if (timetable[day]) {
    timetable[day] = timetable[day].filter((slot) => slot.id !== slotId);
  }
  saveCustomTimetable(timetable);
  return timetable;
};

export const createCustomSubject = (name: string, code?: string): Subject => {
  const customSubjects = getCustomSubjects();
  const allSubjects = getAllSubjects();

  // Generate a unique ID
  const id = `custom-${Date.now()}`;

  // Generate a code if not provided
  const subjectCode = code || name.substring(0, 3).toUpperCase() + "101";

  // Assign a color from the palette
  const colorIndex = allSubjects.length % subjectColors.length;
  const color = subjectColors[colorIndex];

  const newSubject: Subject = {
    id,
    name,
    code: subjectCode,
    color,
  };

  customSubjects.push(newSubject);
  saveCustomSubjects(customSubjects);

  return newSubject;
};

export const undoAttendance = (subjectId: string, date: string) => {
  const records = getAttendanceData();
  const filteredRecords = records.filter(
    (r) => !(r.subjectId === subjectId && r.date === date),
  );
  saveAttendanceData(filteredRecords);
  return filteredRecords;
};

export const initializeSampleData = () => {
  const existingRecords = getAttendanceData();
  if (existingRecords.length === 0) {
    // Add some sample attendance records for demo
    const sampleRecords: AttendanceRecord[] = [
      {
        id: "1-2024-01-15",
        subjectId: "1",
        date: "2024-01-15",
        status: "present",
        markedAt: "2024-01-15T09:00:00Z",
      },
      {
        id: "2-2024-01-15",
        subjectId: "2",
        date: "2024-01-15",
        status: "present",
        markedAt: "2024-01-15T10:00:00Z",
      },
      {
        id: "3-2024-01-15",
        subjectId: "3",
        date: "2024-01-15",
        status: "absent",
        markedAt: "2024-01-15T11:30:00Z",
      },
      {
        id: "1-2024-01-16",
        subjectId: "1",
        date: "2024-01-16",
        status: "present",
        markedAt: "2024-01-16T09:00:00Z",
      },
      {
        id: "2-2024-01-16",
        subjectId: "2",
        date: "2024-01-16",
        status: "absent",
        markedAt: "2024-01-16T10:00:00Z",
      },
      {
        id: "4-2024-01-17",
        subjectId: "4",
        date: "2024-01-17",
        status: "present",
        markedAt: "2024-01-17T09:00:00Z",
      },
      {
        id: "5-2024-01-17",
        subjectId: "5",
        date: "2024-01-17",
        status: "present",
        markedAt: "2024-01-17T10:00:00Z",
      },
    ];
    saveAttendanceData(sampleRecords);
  }
};
