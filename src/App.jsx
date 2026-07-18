import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MEALS } from './lib/constants';
import { autoMeal } from './lib/calc';
import { loadState, saveState, todayKey, emptyDay } from './lib/storage';
import { loadFoods } from './lib/foodSource';
import { FOODS } from './data/foods';
import { IconDefs, Icon } from './components/Icon';
import { TodayView } from './components/TodayView';
import { ProfileView } from './components/ProfileView';
import { LearnView } from './components/LearnView';
import { SetupWizard } from './components/SetupWizard';
import { EatSheet } from './components/EatSheet';
import { NameDialog } from './components/NameDialog';
import { Toast } from './components/Toast';

let uid = 0;
const newId = () => `${Date.now()}-${uid++}`;

export default function App() {
  const [persisted, setPersisted] = useState(loadState);
  const [view, setView] = useState('today'); // today | learn | profile | wizard
  const [eatOpen, setEatOpen] = useState(false);
  const [eatMeal, setEatMeal] = useState(null);
  const [nameOpen, setNameOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [foodsData, setFoodsData] = useState({ foods: FOODS, source: 'local' });
  const toastTimer = useRef(null);

  const dateKey = todayKey();
  const diary = persisted.diaryByDate[dateKey] || emptyDay();
  const state = { ...persisted, diary };

  useEffect(() => { saveState(persisted); }, [persisted]);
  useEffect(() => { loadFoods().then(setFoodsData); }, []);

  const showToast = useCallback((msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 3200);
  }, []);

  const eaten = useMemo(() => {
    const t = { kcal: 0, p: 0, c: 0, f: 0 };
    MEALS.forEach((m) => diary[m].forEach((e) => { t.kcal += e.kcal; t.p += e.p; t.c += e.c; t.f += e.f; }));
    return t;
  }, [diary]);

  const remaining = useMemo(() => ({
    kcal: Math.max(persisted.targets.kcal - eaten.kcal, 0),
    p: Math.max(persisted.targets.p - eaten.p, 0),
    c: Math.max(persisted.targets.c - eaten.c, 0),
    f: Math.max(persisted.targets.f - eaten.f, 0),
  }), [persisted.targets, eaten]);

  const setDiary = (updater) =>
    setPersisted((s) => {
      const day = s.diaryByDate[dateKey] || emptyDay();
      return { ...s, diaryByDate: { ...s.diaryByDate, [dateKey]: updater(day) } };
    });

  const logFood = (food) => {
    const meal = eatMeal || autoMeal();
    setDiary((day) => ({
      ...day,
      [meal]: [...day[meal], { id: newId(), n: food.name, v: food.venue, kcal: food.kcal, p: food.p, c: food.c, f: food.f }],
    }));
    const kcalLeft = Math.max(remaining.kcal - food.kcal, 0);
    showToast(`Logged to ${meal} — ${kcalLeft} cal to go.`);
  };

  const deleteEntry = (meal, id) => {
    setDiary((day) => ({ ...day, [meal]: day[meal].filter((x) => x.id !== id) }));
    showToast('Removed. Budget updated.');
  };

  const openEat = (meal) => { setEatMeal(meal || null); setEatOpen(true); };
  const closeEat = () => { setEatOpen(false); setEatMeal(null); };

  const applyPlan = (plan, profile) => {
    setPersisted((s) => ({
      ...s,
      targets: { kcal: plan.kcal, p: plan.p, c: plan.c, f: plan.f },
      wizardDone: true,
      wizardProfile: profile,
    }));
    setView('today');
    showToast(`Targets set — ${plan.kcal} cal, ${plan.p} g protein a day.`);
    window.scrollTo({ top: 0 });
  };

  const go = (v) => { setView(v); window.scrollTo({ top: 0 }); };

  return (
    <div className="app">
      <IconDefs />
      <div className="top">
        <span className="wordmark">
          <span className="mark" aria-hidden="true"><span className="b1" /><span className="b2" /><span className="b3" /></span>
          MacroMatch
        </span>
      </div>

      <main>
        {view === 'today' && (
          <TodayView state={state} remaining={remaining} eaten={eaten}
            onOpenName={() => setNameOpen(true)} onOpenEat={openEat}
            onDeleteEntry={deleteEntry} onGoWizard={() => go('wizard')} />
        )}
        {view === 'learn' && <LearnView />}
        {view === 'profile' && (
          <ProfileView state={state}
            onSetTarget={(k, v) => setPersisted((s) => ({ ...s, targets: { ...s.targets, [k]: v } }))}
            onOpenName={() => setNameOpen(true)} onGoWizard={() => go('wizard')} />
        )}
        {view === 'wizard' && (
          <SetupWizard initialProfile={persisted.wizardProfile}
            onApply={applyPlan} onGoLearn={() => go('learn')} />
        )}
      </main>

      <EatSheet open={eatOpen} meal={eatMeal || autoMeal()} foods={foodsData.foods}
        foodsSource={foodsData.source} remaining={remaining}
        onLog={logFood} onClose={closeEat} />

      <NameDialog open={nameOpen} name={persisted.name}
        onSave={(n) => { setPersisted((s) => ({ ...s, name: n })); setNameOpen(false); }}
        onClose={() => setNameOpen(false)} />

      <Toast toast={toast} />

      <nav className="navbar" aria-label="Primary">
        <div className="nav-in">
          <div className="nav-side">
            <NavItem id="i-book" label="Diary" active={view === 'today'} onClick={() => go('today')} />
            <NavItem id="i-bulb" label="Learn" active={view === 'learn'} onClick={() => go('learn')} />
          </div>
          <button className="eat-btn" aria-label="Let's see what you can eat" onClick={() => openEat()}>
            <Icon id="i-fork" /><span>Eat</span>
          </button>
          <div className="nav-side">
            <NavItem id="i-user" label="Profile" active={view === 'profile' || view === 'wizard'} onClick={() => go('profile')} />
          </div>
        </div>
      </nav>
    </div>
  );
}

function NavItem({ id, label, active, onClick }) {
  return (
    <button className={`nav-item press${active ? ' active' : ''}`}
      aria-current={active ? 'page' : undefined} onClick={onClick}>
      <Icon id={id} />{label}
    </button>
  );
}
