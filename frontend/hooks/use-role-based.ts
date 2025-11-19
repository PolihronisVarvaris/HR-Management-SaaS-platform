import { useAuth } from './use-auth'
import { useHrEmployee } from './use-hr-employee'
import { useRecruitmentAdmin } from './use-recruitment-admin'

export const useRoleBased = () => {
  const { user } = useAuth()
  
  const hrEmployee = useHrEmployee()
  const recruitmentAdmin = useRecruitmentAdmin()

  // Return hooks based on user role
  switch (user?.role) {
    case 'HR_EMPLOYEE':
      return {
        role: 'HR_EMPLOYEE',
        hooks: hrEmployee,
        permissions: ['view_candidates', 'schedule_interviews', 'update_candidate_status']
      }
    
    case 'RECRUITMENT_ADMIN':
      return {
        role: 'RECRUITMENT_ADMIN',
        hooks: recruitmentAdmin,
        permissions: ['manage_users', 'system_config', 'view_analytics', 'generate_reports']
      }
    
    default:
      return {
        role: 'CANDIDATE',
        hooks: null,
        permissions: ['view_profile', 'view_applications', 'apply_jobs']
      }
  }
}