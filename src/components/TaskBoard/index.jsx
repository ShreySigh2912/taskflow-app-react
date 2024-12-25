import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';

// Sample initial tasks for testing
const initialTasks = {
  pending: [
    { id: '1', title: 'Task 1', description: 'Sample task 1', priority: 'high' },
    { id: '2', title: 'Task 2', description: 'Sample task 2', priority: 'medium' }
  ],
  doing: [
    { id: '3', title: 'Task 3', description: 'Sample task 3', priority: 'low' }
  ],
  done: []
};

const TaskBoard = () => {
  // Initialize state with sample data
  const [tasks, setTasks] = useState(initialTasks);
  const [draggingTask, setDraggingTask] = useState(null);
  const [isAddingTask, setIsAddingTask] = useState(false);

  // Load tasks from localStorage on component mount
  useEffect(() => {
    const storedTasks = localStorage.getItem('tasks');
    if (storedTasks) {
      try {
        const parsedTasks = JSON.parse(storedTasks);
        // Ensure all required arrays exist
        setTasks({
          pending: Array.isArray(parsedTasks.pending) ? parsedTasks.pending : [],
          doing: Array.isArray(parsedTasks.doing) ? parsedTasks.doing : [],
          done: Array.isArray(parsedTasks.done) ? parsedTasks.done : []
        });
      } catch (error) {
        console.error('Error parsing stored tasks:', error);
        setTasks(initialTasks);
      }
    }
  }, []);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const handleDragStart = (e, task, sourceColumn) => {
    e.dataTransfer.setData('taskId', task.id);
    e.dataTransfer.setData('sourceColumn', sourceColumn);
    setDraggingTask({ task, sourceColumn });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('bg-blue-50');
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove('bg-blue-50');
  };

  const handleDrop = (e, targetColumn) => {
    e.preventDefault();
    e.currentTarget.classList.remove('bg-blue-50');
    
    const sourceColumn = e.dataTransfer.getData('sourceColumn');
    
    if (sourceColumn === targetColumn) return;
    if (!draggingTask) return;

    // Ensure arrays exist before operating on them
    const sourceList = Array.isArray(tasks[sourceColumn]) ? [...tasks[sourceColumn]] : [];
    const targetList = Array.isArray(tasks[targetColumn]) ? [...tasks[targetColumn]] : [];
    
    const taskIndex = sourceList.findIndex(t => t.id === draggingTask.task.id);
    if (taskIndex > -1) {
      const [movedTask] = sourceList.splice(taskIndex, 1);
      targetList.push(movedTask);
      
      setTasks({
        ...tasks,
        [sourceColumn]: sourceList,
        [targetColumn]: targetList
      });
    }
    
    setDraggingTask(null);
  };

  const renderTaskColumn = (title, columnKey) => {
    // Ensure the column array exists
    const columnTasks = Array.isArray(tasks[columnKey]) ? tasks[columnKey] : [];
    
    return (
      <div
        className="bg-gray-50 rounded-lg p-4 min-h-96"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, columnKey)}
      >
        <h2 className="text-lg font-semibold text-gray-700 mb-4">{title}</h2>
        <div className="space-y-3">
          {columnTasks.map((task) => (
            <Card
              key={task.id}
              draggable
              onDragStart={(e) => handleDragStart(e, task, columnKey)}
              className="bg-white p-4 cursor-move hover:shadow-md transition-shadow"
            >
              <h3 className="font-medium text-gray-900 mb-2">{task.title}</h3>
              {task.description && (
                <p className="text-gray-600 text-sm mb-3">{task.description}</p>
              )}
              <div className="flex justify-between text-sm text-gray-500">
                {task.dueDate && (
                  <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                )}
                {task.priority && (
                  <span className={
                    task.priority.toLowerCase() === 'high' ? 'text-red-500' :
                    task.priority.toLowerCase() === 'medium' ? 'text-yellow-500' :
                    'text-green-500'
                  }>
                    {task.priority}
                  </span>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Task Board</h1>
        <button
          onClick={() => setIsAddingTask(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg shadow-sm transition-colors"
        >
          Add Task
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {renderTaskColumn('Pending', 'pending')}
        {renderTaskColumn('Doing', 'doing')}
        {renderTaskColumn('Done', 'done')}
      </div>

      {isAddingTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          {/* Task Form will be added here */}
        </div>
      )}
    </div>
  );
};

export default TaskBoard;