import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Activity, 
  Calendar, 
  TrendingUp, 
  Target, 
  Dumbbell,
  Users,
  Clock,
  Flame,
  Award,
  Plus
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useWorkout } from '../context/WorkoutContext'
import { useProgress } from '../context/ProgressContext'
import { useSocial } from '../context/SocialContext'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import Button from '../components/ui/Button'

const Dashboard = () => {
  const { user } = useAuth()
  const { workouts, isLoading: workoutsLoading } = useWorkout()
  const { progressData, personalRecords } = useProgress()
  const { followers, following } = useSocial()
  const [recentActivity, setRecentActivity] = useState([])
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    totalExercises: 0,
    totalDuration: 0,
    weeklyGoal: 0
  })

  useEffect(() => {
    // Load user stats
    if (user?.stats) {
      setStats({
        totalWorkouts: user.stats.totalWorkouts || 0,
        totalExercises: user.stats.totalExercises || 0,
        totalDuration: user.stats.totalDuration || 0,
        weeklyGoal: user.goals?.weeklyWorkouts || 3
      })
    }
  }, [user])

  const quickActions = [
    {
      title: 'Start Workout',
      description: 'Begin a new training session',
      icon: Dumbbell,
      href: '/workouts/new',
      color: 'bg-primary-500'
    },
    {
      title: 'Log Progress',
      description: 'Track your fitness progress',
      icon: TrendingUp,
      href: '/progress/new',
      color: 'bg-green-500'
    },
    {
      title: 'Browse Exercises',
      description: 'Explore exercise library',
      icon: Activity,
      href: '/exercises',
      color: 'bg-blue-500'
    },
    {
      title: 'Social Feed',
      description: 'See what friends are doing',
      icon: Users,
      href: '/social',
      color: 'bg-purple-500'
    }
  ]

  const todaysStats = [
    {
      title: 'Workouts',
      value: '2',
      icon: Dumbbell,
      change: '+1 from yesterday',
      color: 'text-primary-600'
    },
    {
      title: 'Duration',
      value: '45m',
      icon: Clock,
      change: '+15m from yesterday',
      color: 'text-green-600'
    },
    {
      title: 'Calories',
      value: '320',
      icon: Flame,
      change: '+50 from yesterday',
      color: 'text-orange-600'
    },
    {
      title: 'PRs',
      value: '1',
      icon: Award,
      change: 'New personal record!',
      color: 'text-yellow-600'
    }
  ]

  if (workoutsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome back, {user?.profile?.firstName || user?.username}! 💪
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Ready to crush your fitness goals today?
            </p>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon
              return (
                <motion.div
                  key={action.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Link
                    to={action.href}
                    className="card p-6 hover:shadow-strong transition-all duration-300 group"
                  >
                    <div className={`${action.color} p-3 rounded-lg w-fit mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      {action.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {action.description}
                    </p>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Today's Stats */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Today's Activity
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {todaysStats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="card p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <Icon className={`h-8 w-8 ${stat.color}`} />
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </span>
                  </div>
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    {stat.title}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {stat.change}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Workouts */}
          <div className="lg:col-span-2">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Recent Workouts
                </h2>
                <Link to="/workouts">
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </Link>
              </div>
              
              {workouts.length > 0 ? (
                <div className="space-y-4">
                  {workouts.slice(0, 3).map((workout, index) => (
                    <motion.div
                      key={workout._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="bg-primary-100 dark:bg-primary-900 p-2 rounded-lg">
                          <Dumbbell className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {workout.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {workout.exercises?.length} exercises • {workout.duration || 30} min
                          </p>
                        </div>
                      </div>
                      <Link to={`/workouts/${workout._id}`}>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Dumbbell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    No workouts yet. Start your fitness journey!
                  </p>
                  <Link to="/workouts/new">
                    <Button leftIcon={<Plus className="h-4 w-4" />}>
                      Create First Workout
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Progress Chart */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Weekly Progress
              </h3>
              <div className="h-32 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400">Chart Placeholder</p>
              </div>
            </div>

            {/* Personal Records */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Personal Records
                </h3>
                <Link to="/progress">
                  <Button variant="ghost" size="sm">
                    View All
                  </Button>
                </Link>
              </div>
              
              {personalRecords.length > 0 ? (
                <div className="space-y-3">
                  {personalRecords.slice(0, 3).map((record, index) => (
                    <div key={record._id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {record.exerciseId?.name || 'Exercise'}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {record.recordType}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">
                        {record.value} {record.unit}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <Award className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    No personal records yet
                  </p>
                </div>
              )}
            </div>

            {/* Social Stats */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Your Community
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Followers</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {followers.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Following</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {following.length}
                  </span>
                </div>
              </div>
              <Link to="/social" className="block mt-4">
                <Button variant="outline" size="sm" fullWidth>
                  Explore Community
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
