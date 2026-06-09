import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Layout from '../../components/Layout'
import { FiPlay, FiPause, FiSquare, FiClock, FiCalendar, FiDownload, FiFileText } from 'react-icons/fi'
import { format, differenceInSeconds } from 'date-fns'

export default function TimeTracking() {
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [currentTimer, setCurrentTimer] = useState({
    project: '',
    task: '',
    startTime: null,
    elapsed: 0,
  })
  const [timeEntries, setTimeEntries] = useState([
    {
      id: '1',
      project: 'Website Redesign',
      client: 'Acme Corporation',
      task: 'Frontend Development',
      date: new Date('2025-10-18'),
      duration: 7200, // 2 hours in seconds
      billable: true,
    },
    {
      id: '2',
      project: 'Mobile App',
      client: 'Tech Startup Inc',
      task: 'UI Design',
      date: new Date('2025-10-18'),
      duration: 5400, // 1.5 hours
      billable: true,
    },
    {
      id: '3',
      project: 'Website Redesign',
      client: 'Acme Corporation',
      task: 'Code Review',
      date: new Date('2025-10-17'),
      duration: 3600, // 1 hour
      billable: false,
    },
  ])

  useEffect(() => {
    let interval
    if (isTimerRunning) {
      interval = setInterval(() => {
        setCurrentTimer(prev => ({
          ...prev,
          elapsed: differenceInSeconds(new Date(), prev.startTime)
        }))
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isTimerRunning])

  const startTimer = () => {
    setCurrentTimer({
      ...currentTimer,
      startTime: new Date(),
      elapsed: 0,
    })
    setIsTimerRunning(true)
  }

  const pauseTimer = () => {
    setIsTimerRunning(false)
  }

  const stopTimer = () => {
    if (currentTimer.project && currentTimer.task) {
      const newEntry = {
        id: Date.now().toString(),
        project: currentTimer.project,
        client: 'Acme Corporation', // TODO: Get from selected project
        task: currentTimer.task,
        date: new Date(),
        duration: currentTimer.elapsed,
        billable: true,
      }
      setTimeEntries([newEntry, ...timeEntries])
      
      // TODO: Also save to timesheet database
      console.log('Saved to timesheet:', newEntry)
    }
    setCurrentTimer({
      project: '',
      task: '',
      startTime: null,
      elapsed: 0,
    })
    setIsTimerRunning(false)
  }

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const totalToday = timeEntries
    .filter(entry => format(entry.date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd'))
    .reduce((sum, entry) => sum + entry.duration, 0) + (isTimerRunning ? currentTimer.elapsed : 0)

  const totalWeek = timeEntries.reduce((sum, entry) => sum + entry.duration, 0) + (isTimerRunning ? currentTimer.elapsed : 0)

  const billableHours = timeEntries
    .filter(entry => entry.billable)
    .reduce((sum, entry) => sum + entry.duration, 0) / 3600

  return (
    <>
      <Head>
        <title>Time Tracking - Boarded</title>
      </Head>
      <Layout>
        <div className="space-y-6 fade-in">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-text-primary mb-2">
                Time Tracking
              </h1>
              <p className="text-text-secondary">
                Track your time and generate timesheets
              </p>
            </div>
            <Link href="/timesheets" className="btn btn-secondary">
              <FiFileText size={16} />
              View Timesheets
            </Link>
          </div>

          {/* Timer */}
          <div className="card-elevated">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="What are you working on?"
                    value={currentTimer.task}
                    onChange={(e) => setCurrentTimer({ ...currentTimer, task: e.target.value })}
                    className="input"
                    disabled={isTimerRunning}
                  />
                </div>
                <div className="w-64">
                  <select
                    value={currentTimer.project}
                    onChange={(e) => setCurrentTimer({ ...currentTimer, project: e.target.value })}
                    className="select"
                    disabled={isTimerRunning}
                  >
                    <option value="">Select project</option>
                    <option value="Website Redesign">Website Redesign</option>
                    <option value="Mobile App">Mobile App</option>
                    <option value="Brand Identity">Brand Identity</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-4xl font-mono font-bold text-accent">
                  {formatDuration(currentTimer.elapsed)}
                </div>
                <div className="flex items-center gap-2">
                  {!isTimerRunning ? (
                    <button
                      onClick={startTimer}
                      disabled={!currentTimer.task || !currentTimer.project}
                      className="btn btn-primary btn-lg"
                    >
                      <FiPlay size={20} />
                      Start
                    </button>
                  ) : (
                    <>
                      <button onClick={pauseTimer} className="btn btn-secondary btn-lg">
                        <FiPause size={20} />
                        Pause
                      </button>
                      <button onClick={stopTimer} className="btn btn-primary btn-lg">
                        <FiSquare size={20} />
                        Stop
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card">
              <div className="flex items-center gap-3 mb-2">
                <FiClock className="text-blue-500" size={20} />
                <p className="text-text-secondary text-sm">Today</p>
              </div>
              <p className="text-2xl font-semibold text-text-primary">
                {(totalToday / 3600).toFixed(1)}h
              </p>
            </div>
            <div className="card">
              <div className="flex items-center gap-3 mb-2">
                <FiCalendar className="text-green-500" size={20} />
                <p className="text-text-secondary text-sm">This Week</p>
              </div>
              <p className="text-2xl font-semibold text-text-primary">
                {(totalWeek / 3600).toFixed(1)}h
              </p>
            </div>
            <div className="card">
              <div className="flex items-center gap-3 mb-2">
                <FiDownload className="text-yellow-500" size={20} />
                <p className="text-text-secondary text-sm">Billable Hours</p>
              </div>
              <p className="text-2xl font-semibold text-text-primary">
                {billableHours.toFixed(1)}h
              </p>
            </div>
          </div>

          {/* Time Entries */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text-primary">Recent Entries</h2>
              <button className="btn btn-secondary btn-sm">
                <FiDownload size={16} />
                Export Timesheet
              </button>
            </div>

            <div className="space-y-2">
              {timeEntries.map(entry => (
                <div key={entry.id} className="flex items-center justify-between p-3 rounded-lg bg-background-elevated hover:bg-background-tertiary transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="text-sm font-medium text-text-primary">{entry.task}</p>
                      <span className={`badge ${entry.billable ? 'badge-success' : 'text-text-tertiary'}`}>
                        {entry.billable ? 'Billable' : 'Non-billable'}
                      </span>
                    </div>
                    <p className="text-xs text-text-tertiary">
                      {entry.project} • {entry.client} • {format(entry.date, 'MMM dd, yyyy')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono font-semibold text-text-primary">
                      {formatDuration(entry.duration)}
                    </p>
                    <p className="text-xs text-text-tertiary">
                      {(entry.duration / 3600).toFixed(2)}h
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    </>
  )
}

