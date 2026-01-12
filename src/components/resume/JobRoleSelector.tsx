import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Code, Calendar, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { 
  SOFTWARE_ENGINEERING_ROLES, 
  TECH_STACK_OPTIONS, 
  getDefaultTechStackForRole,
  generateJobDescription,
  type JobRole,
  type TechStack
} from '../../utils/job-description-generator';
import LoadingSpinner from '../ui/LoadingSpinner';

export default function JobRoleSelector() {
  const { state, setJobDescription } = useApp();
  const [selectedRole, setSelectedRole] = useState<JobRole | null>(null);
  const [yearsOfExperience, setYearsOfExperience] = useState<number>(3);
  const [selectedTechStack, setSelectedTechStack] = useState<TechStack[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showTechStack, setShowTechStack] = useState(false);

  // Note: Default tech stack is set in handleRoleSelect, not here

  const handleRoleSelect = (role: JobRole) => {
    setSelectedRole(role);
    const defaults = getDefaultTechStackForRole(role.id);
    setSelectedTechStack(defaults);
    setShowTechStack(true);
  };

  const toggleTechStack = (tech: TechStack) => {
    setSelectedTechStack(prev => {
      const isSelected = prev.some(t => t.id === tech.id);
      if (isSelected) {
        return prev.filter(t => t.id !== tech.id);
      } else {
        return [...prev, tech];
      }
    });
  };

  const handleAnalyze = async () => {
    if (!selectedRole || selectedTechStack.length === 0) {
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const jobDescription = generateJobDescription(
        selectedRole,
        yearsOfExperience,
        selectedTechStack
      );

      await setJobDescription(jobDescription);
    } catch (error) {
      console.error('Error generating job description:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const techStackByCategory = {
    language: TECH_STACK_OPTIONS.filter(t => t.category === 'language'),
    framework: TECH_STACK_OPTIONS.filter(t => t.category === 'framework'),
    database: TECH_STACK_OPTIONS.filter(t => t.category === 'database'),
    platform: TECH_STACK_OPTIONS.filter(t => t.category === 'platform'),
    tool: TECH_STACK_OPTIONS.filter(t => t.category === 'tool')
  };

  const canAnalyze = selectedRole && selectedTechStack.length > 0 && !isAnalyzing;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="card"
    >
      <div className="flex items-center space-x-2 mb-4">
        <Briefcase className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Analyze Resume for Specific Role
        </h2>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Select a job role, experience level, and tech stack to generate a comprehensive job description and analyze your resume compatibility.
      </p>

      {/* Job Role Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          <Code className="w-4 h-4 inline mr-1" />
          Job Role
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {SOFTWARE_ENGINEERING_ROLES.map(role => (
            <button
              key={role.id}
              onClick={() => handleRoleSelect(role)}
              className={`p-3 rounded-lg border-2 text-left transition-all ${
                selectedRole?.id === role.id
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="font-medium text-sm text-gray-900 dark:text-gray-100">
                {role.title}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {role.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Years of Experience */}
      {selectedRole && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mb-6"
        >
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            <Calendar className="w-4 h-4 inline mr-1" />
            Years of Experience
          </label>
          <div className="flex items-center space-x-4">
            <input
              type="range"
              min="0"
              max="15"
              value={yearsOfExperience}
              onChange={(e) => setYearsOfExperience(Number(e.target.value))}
              className="flex-1"
            />
            <div className="w-20 text-center font-medium text-gray-900 dark:text-gray-100">
              {yearsOfExperience} {yearsOfExperience === 1 ? 'year' : 'years'}
            </div>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {yearsOfExperience < 2 && 'Junior level'}
            {yearsOfExperience >= 2 && yearsOfExperience < 5 && 'Mid-level'}
            {yearsOfExperience >= 5 && yearsOfExperience < 8 && 'Senior level'}
            {yearsOfExperience >= 8 && 'Lead/Senior level'}
          </div>
        </motion.div>
      )}

      {/* Tech Stack Selection */}
      {selectedRole && showTechStack && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mb-6"
        >
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            <Code className="w-4 h-4 inline mr-1" />
            Tech Stack ({selectedTechStack.length} selected)
          </label>

          {Object.entries(techStackByCategory).map(([category, techs]) => (
            <div key={category} className="mb-4">
              <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 uppercase">
                {category}
              </div>
              <div className="flex flex-wrap gap-2">
                {techs.map(tech => {
                  const isSelected = selectedTechStack.some(t => t.id === tech.id);
                  return (
                    <button
                      key={tech.id}
                      onClick={() => toggleTechStack(tech)}
                      className={`px-3 py-1.5 rounded-full text-sm transition-all flex items-center gap-1 ${
                        isSelected
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {isSelected && <CheckCircle2 className="w-3 h-3" />}
                      {tech.name}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Analyze Button */}
      {canAnalyze && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="w-full btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isAnalyzing ? (
              <>
                <LoadingSpinner />
                <span>Analyzing Resume...</span>
              </>
            ) : (
              <>
                <Briefcase className="w-5 h-5" />
                <span>Analyze Resume for This Role</span>
              </>
            )}
          </button>
        </motion.div>
      )}

      {state.jobDescription && !isAnalyzing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 p-3 bg-success-50 dark:bg-success-900/20 rounded-lg border border-success-200 dark:border-success-800"
        >
          <div className="flex items-center gap-2 text-success-700 dark:text-success-300">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-sm font-medium">
              Job requirements generated. Resume analysis in progress...
            </span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

