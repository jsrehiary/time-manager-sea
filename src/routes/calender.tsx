import Layout from "@/components/Layout";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { taskApi } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Task } from "@/lib/api";

export const Route = createFileRoute("/calender")({
  component: RouteComponent,
});

interface DayTasks {
  date: Date;
  tasks: Task[];
}

function RouteComponent() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const {
    data: tasks = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["tasks"],
    queryFn: taskApi.getAllTasks,
  });

  const getMonthName = (date: Date) => {
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, firstDay };
  };

  const getTasksForDate = (date: Date): Task[] => {
    return (
      tasks?.filter((task) => {
        if (!task.due_date) return false;
        const taskDate = new Date(task.due_date);
        return (
          taskDate.getDate() === date.getDate() &&
          taskDate.getMonth() === date.getMonth() &&
          taskDate.getFullYear() === date.getFullYear()
        );
      }) || []
    );
  };

  const goToPreviousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const goToNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const renderCalendar = () => {
    const { daysInMonth, startingDayOfWeek, firstDay } =
      getDaysInMonth(currentDate);
    const days = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(
        <div key={`empty-${i}`} className="bg-gray-50 border border-gray-200" />
      );
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(firstDay.getFullYear(), firstDay.getMonth(), day);
      const tasksForDay = getTasksForDate(date);
      const isCurrentDay = isToday(date);
      const isPast = isPastDate(date);

      days.push(
        <div
          key={day}
          className={`bg-white border border-gray-200 p-1 sm:p-2 overflow-hidden hover:bg-purple-50 transition-colors flex flex-col ${
            isCurrentDay
              ? "bg-purple-100 border-purple-400 ring-2 ring-purple-300"
              : ""
          }`}
        >
          <div
            className={`text-xs sm:text-sm font-semibold mb-1 shrink-0 ${
              isCurrentDay
                ? "text-purple-700"
                : isPast
                  ? "text-gray-400"
                  : "text-gray-700"
            }`}
          >
            {day}
          </div>
          <div className="space-y-0.5 flex-1 overflow-y-auto overflow-x-hidden">
            {tasksForDay.slice(0, 2).map((task) => (
              <div
                key={task.id}
                className={`text-[9px] sm:text-[10px] lg:text-xs p-0.5 sm:p-1 rounded truncate shadow-sm ${
                  task.priority === "high"
                    ? "bg-red-100 text-red-800 border border-red-300"
                    : task.priority === "medium"
                      ? "bg-yellow-100 text-yellow-800 border border-yellow-300"
                      : "bg-purple-50 text-purple-700 border border-purple-200"
                }`}
                title={task.title}
              >
                {task.title}
              </div>
            ))}
            {tasksForDay.length > 2 && (
              <div className="text-[9px] sm:text-[10px] lg:text-xs text-gray-500 pl-0.5 sm:pl-1">
                +{tasksForDay.length - 2} more
              </div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-zinc-400">Loading calendar...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className=" h-full flex flex-col overflow-hidden bg-[#322350]rounded-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 flex-shrink-0">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
            <span className="hidden sm:inline text-white">Task Calendar</span>
            <span className="sm:hidden">Calendar</span>
          </h1>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
            <Button
              variant="outline"
              size="sm"
              onClick={goToToday}
              className="bg-white text-purple-700 border-purple-300 hover:bg-purple-50 text-xs sm:text-sm shadow-sm"
            >
              Today
            </Button>
            <div className="flex items-center gap-1 sm:gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={goToPreviousMonth}
                className="bg-white text-purple-700 border-purple-300 hover:bg-purple-50 p-2 shadow-sm"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-white sm:text-xl font-semibold text-gray-900 min-w-[140px] sm:min-w-[200px] text-center px-2">
                {getMonthName(currentDate)}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={goToNextMonth}
                className="bg-white text-purple-700 border-purple-300 hover:bg-purple-50 p-2 shadow-sm"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        <Card className="bg-white border-purple-200 p-2 sm:p-4 flex-1 flex flex-col overflow-hidden shadow-lg">
          <div className="grid grid-cols-7 gap-px mb-px flex-shrink-0">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="text-center text-xs sm:text-sm font-semibold text-purple-700 py-1 sm:py-2 bg-purple-100"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-px bg-purple-200 flex-1 auto-rows-fr">
            {renderCalendar()}
          </div>
        </Card>
        <div className="mt-4 flex flex-wrap items-center gap-3 sm:gap-6 text-xs sm:text-sm text-gray-600 text-white shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-red-100 border border-red-300 rounded shadow-sm"></div>
            <span>High Priority</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-yellow-100 border border-yellow-300 rounded shadow-sm"></div>
            <span>Medium Priority</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-purple-50 border border-purple-200 rounded shadow-sm"></div>
            <span>Normal Priority</span>
          </div>
        </div>
      </div>
    </Layout>
  );
}
