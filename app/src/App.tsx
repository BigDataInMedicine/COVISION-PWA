import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import './localization/i18n';
import { ThemeProvider } from './context/ThemeContext';
import HomeScreen from './screens/general/home';
import TestMemoryScreen from './screens/test/memory';
import TestMatchingScreen from './screens/test/matching';
import TestStroopScreen from './screens/test/stroop';
import TestEndScreen from './screens/general/testEnd';
import QuestionnaireActivitiesMust from './screens/postTest/activitiesMust';
import QuestionnaireActivitiesRecovery from './screens/postTest/activitiesRecovery';
import QuestionnaireSubstancesScreen from './screens/postTest/substances';
import QuestionnaireSymptomsMentalScreen from './screens/preTest/symptomsMental';
import QuestionnaireSymptomsPhysicalScreen from './screens/postTest/symptomsPhysical';
import QuestionnaireFatigueScreen from './screens/general/fatigue';
import QuestionnaireDurationScreen from './screens/preTest/duration';
import QuestionnaireMoodScreen from './screens/postTest/mood';
import NoTestScreen from './screens/general/noTestPrevious';
import NoTestNowScreen from './screens/general/noTestNow';
import LastTestOpinionScreen from './screens/general/lastTestOpinion';
import QuestionnaireSleepScreen from './screens/general/sleep';
import QuestionnairePerformanceScreen from './screens/postTest/performance';
import SymptomsScreen from './screens/general/symptoms';

const App: React.FC = () => {
  return (
    <Router>
      <ThemeProvider>
        <Routes>
          {/* General */}
          <Route path="/" element={<HomeScreen />} />
          <Route path="/no-test-previous" element={<NoTestScreen />} />
          <Route path="/last-test-opinion" element={<LastTestOpinionScreen />} />
          <Route path="/no-test-now" element={<NoTestNowScreen />} />
          <Route path="/test-end" element={<TestEndScreen />} />
          <Route path="/symptoms" element={<SymptomsScreen />} />

          {/* Pre Test */}
          <Route path="/q/duration" element={<QuestionnaireDurationScreen />} />
          <Route path="/q/fatigue" element={<QuestionnaireFatigueScreen />} />
          <Route path="/q/symptoms-mental" element={<QuestionnaireSymptomsMentalScreen />} />

          {/* Test */}
          <Route path="/t/memory" element={<TestMemoryScreen />} />
          <Route path="/t/matching" element={<TestMatchingScreen />} />
          <Route path="/t/stroop" element={<TestStroopScreen />} />

          {/* Post Test */}
          <Route path="/q/sleep" element={<QuestionnaireSleepScreen />} />
          <Route path="/q/activities-must" element={<QuestionnaireActivitiesMust />} />
          <Route path="/q/activities-recovery" element={<QuestionnaireActivitiesRecovery />} />
          <Route path="/q/mood" element={<QuestionnaireMoodScreen />} />
          <Route path="/q/substances" element={<QuestionnaireSubstancesScreen />} />
          <Route path="/q/symptoms-physical" element={<QuestionnaireSymptomsPhysicalScreen />} />
          <Route path="/q/performance" element={<QuestionnairePerformanceScreen />} />

          {/* Redirect unknown routes to home */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </ThemeProvider>
    </Router>
  );
};

export default App;
