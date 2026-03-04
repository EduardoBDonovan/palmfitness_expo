import { WorkoutPost, Exercise, ExerciseSet, ExercisePose } from '../types';

export enum MuscleGroup {
  chest = 'chest',
  shoulders = 'shoulders',
  rearDelts = 'rearDelts',
  traps = 'traps',
  lats = 'lats',
  lowerBack = 'lowerBack',
  biceps = 'biceps',
  triceps = 'triceps',
  forearms = 'forearms',
  abs = 'abs',
  obliques = 'obliques',
  quads = 'quads',
  adductors = 'adductors',
  glutes = 'glutes',
  hamstrings = 'hamstrings',
  calves = 'calves'
}

type MuscleMapping = { primary: MuscleGroup[], secondary: MuscleGroup[] };

export const MuscleMapper = {
  canonicalMapping: new Map<string, MuscleMapping>(),

  init() {
    const squatMapping = { primary: [MuscleGroup.quads, MuscleGroup.glutes], secondary: [MuscleGroup.adductors, MuscleGroup.hamstrings] };
    const shrugMapping = { primary: [MuscleGroup.traps], secondary: [] };
    const rowMapping = { primary: [MuscleGroup.lats], secondary: [MuscleGroup.rearDelts, MuscleGroup.traps, MuscleGroup.biceps, MuscleGroup.forearms] };
    const rearDeltMapping = { primary: [MuscleGroup.rearDelts], secondary: [MuscleGroup.traps] };
    const rdlMapping = { primary: [MuscleGroup.hamstrings, MuscleGroup.glutes], secondary: [MuscleGroup.lowerBack] };
    const pushPressMapping = { primary: [MuscleGroup.shoulders], secondary: [MuscleGroup.triceps, MuscleGroup.traps] };
    const overheadMapping = { primary: [MuscleGroup.shoulders], secondary: [MuscleGroup.triceps] };
    const legPressMapping = { primary: [MuscleGroup.quads, MuscleGroup.glutes], secondary: [MuscleGroup.adductors] };
    const legExtMapping = { primary: [MuscleGroup.quads], secondary: [] };
    const lateralMapping = { primary: [MuscleGroup.shoulders], secondary: [] };
    const landmineMapping = { primary: [MuscleGroup.shoulders], secondary: [MuscleGroup.triceps, MuscleGroup.obliques] };
    const inclineMapping = { primary: [MuscleGroup.chest, MuscleGroup.shoulders], secondary: [MuscleGroup.triceps] };
    const hamstringCurlMapping = { primary: [MuscleGroup.hamstrings], secondary: [] };
    const hammerMapping = { primary: [MuscleGroup.biceps, MuscleGroup.forearms], secondary: [] };
    const flyMapping = { primary: [MuscleGroup.chest], secondary: [MuscleGroup.shoulders] };
    const declineMapping = { primary: [MuscleGroup.chest], secondary: [MuscleGroup.triceps] };
    const deadliftMapping = { primary: [MuscleGroup.hamstrings, MuscleGroup.glutes, MuscleGroup.lowerBack], secondary: [MuscleGroup.traps, MuscleGroup.forearms] };
    const curlMapping = { primary: [MuscleGroup.biceps], secondary: [MuscleGroup.forearms] };
    const closeGripMapping = { primary: [MuscleGroup.chest, MuscleGroup.triceps], secondary: [MuscleGroup.shoulders] };
    const chinUpMapping = { primary: [MuscleGroup.lats], secondary: [MuscleGroup.biceps, MuscleGroup.forearms] };
    const calfMapping = { primary: [MuscleGroup.calves], secondary: [] };
    const benchMapping = { primary: [MuscleGroup.chest], secondary: [MuscleGroup.shoulders, MuscleGroup.triceps] };
    const arnoldMapping = { primary: [MuscleGroup.shoulders], secondary: [MuscleGroup.triceps] };
    const adductorMapping = { primary: [MuscleGroup.adductors], secondary: [] };

    const add = (name: string, mapping: MuscleMapping) => this.canonicalMapping.set(this.normalize(name), mapping);

    add("sumo deadlift", deadliftMapping);
    add("split squat", squatMapping);
    add("smith machine shoulder press", overheadMapping);
    add("smith machine bench press", benchMapping);
    add("shrugs", shrugMapping);
    add("seated leg curl", hamstringCurlMapping);
    add("seated dumbbell press", overheadMapping);
    add("seated cable row", rowMapping);
    add("seated barbell press", overheadMapping);
    add("romanian deadlift", rdlMapping);
    add("reverse fly", rearDeltMapping);
    add("rear delt fly", rearDeltMapping);
    add("rdl", rdlMapping);
    add("pushups", benchMapping);
    add("push press", pushPressMapping);
    add("pullup", rowMapping);
    add("preacher curl", curlMapping);
    add("pec deck", flyMapping);
    add("overhead press", overheadMapping);
    add("onearm db row", rowMapping);
    add("military press", overheadMapping);
    add("machine shoulder press", overheadMapping);
    add("machine row", rowMapping);
    add("machine chest press", benchMapping);
    add("lying leg curl", hamstringCurlMapping);
    add("lunges", squatMapping);
    add("leg press", legPressMapping);
    add("leg extension", legExtMapping);
    add("lat pulldown", rowMapping);
    add("landmine press", landmineMapping);
    add("incline dumbbell curl", curlMapping);
    add("incline dumbbell bench press", inclineMapping);
    add("incline barbell bench press", inclineMapping);
    add("hamstring curl", hamstringCurlMapping);
    add("hammer curl", hammerMapping);
    add("front squat", squatMapping);
    add("front raise", lateralMapping);
    add("face pull", rearDeltMapping);
    add("ez bar curl", curlMapping);
    add("dumbbell shoulder press", overheadMapping);
    add("dumbbell row", rowMapping);
    add("dumbbell overhead press", overheadMapping);
    add("dumbbell lateral raise", lateralMapping);
    add("dumbbell fly", flyMapping);
    add("dumbbell curl", curlMapping);
    add("dumbbell bicep curls", curlMapping);
    add("dumbbell bench press", benchMapping);
    add("decline barbell bench press", declineMapping);
    add("crossbody hammer curl", hammerMapping);
    add("conventional deadlift", deadliftMapping);
    add("close grip bench press", closeGripMapping);
    add("chinup", chinUpMapping);
    add("chest supported row", rowMapping);
    add("calf raise", calfMapping);
    add("cable lateral raise", lateralMapping);
    add("cable fly", flyMapping);
    add("cable curl", curlMapping);
    add("bulgarian split squat", squatMapping);
    add("barbell shoulder press", overheadMapping);
    add("barbell row", rowMapping);
    add("barbell overhead press", overheadMapping);
    add("barbell curl", curlMapping);
    add("barbell bench press", benchMapping);
    add("back squat", squatMapping);
    add("arnold press", arnoldMapping);
    add("alternating dumbbell curl", curlMapping);
    add("adductor machine", adductorMapping);
  },

  normalize(name: string): string {
    return name.toLowerCase().replace(/[^\w\s]/gi, '').split(/\s+/).filter(s => s !== '').join(' ');
  },

  getMuscles(exerciseName: string): MuscleMapping {
    if (this.canonicalMapping.size === 0) this.init();
    
    const normalized = this.normalize(exerciseName);
    const canonical = this.canonicalMapping.get(normalized);
    if (canonical) return canonical;

    return this.matchByKeywords(normalized);
  },

  matchByKeywords(normalized: string): MuscleMapping {
    if (normalized.includes("bench") || normalized.includes("chest press")) {
      if (normalized.includes("incline")) return { primary: [MuscleGroup.chest, MuscleGroup.shoulders], secondary: [MuscleGroup.triceps] };
      if (normalized.includes("decline")) return { primary: [MuscleGroup.chest], secondary: [MuscleGroup.triceps] };
      if (normalized.includes("close grip")) return { primary: [MuscleGroup.chest, MuscleGroup.triceps], secondary: [MuscleGroup.shoulders] };
      return { primary: [MuscleGroup.chest], secondary: [MuscleGroup.shoulders, MuscleGroup.triceps] };
    }

    if (normalized.includes("shoulder press") || normalized.includes("overhead press") || normalized.includes("military") || normalized.includes("ohp")) {
      return { primary: [MuscleGroup.shoulders], secondary: [MuscleGroup.triceps] };
    }
    if (normalized.includes("push press")) return { primary: [MuscleGroup.shoulders], secondary: [MuscleGroup.triceps, MuscleGroup.traps] };
    if (normalized.includes("lateral raise") || normalized.includes("front raise")) return { primary: [MuscleGroup.shoulders], secondary: [] };
    if (normalized.includes("face pull") || normalized.includes("reverse fly")) return { primary: [MuscleGroup.rearDelts], secondary: [MuscleGroup.traps] };
    if (normalized.includes("tricep") || normalized.includes("skullcrusher") || normalized.includes("pushdown")) return { primary: [MuscleGroup.triceps], secondary: [] };

    if (normalized.includes("curl")) {
      if (normalized.includes("hammer")) return { primary: [MuscleGroup.biceps, MuscleGroup.forearms], secondary: [] };
      return { primary: [MuscleGroup.biceps], secondary: [MuscleGroup.forearms] };
    }

    if (normalized.includes("chin up") || normalized.includes("chinup")) return { primary: [MuscleGroup.lats], secondary: [MuscleGroup.biceps, MuscleGroup.forearms] };
    if (normalized.includes("row") || normalized.includes("pulldown") || normalized.includes("pull up")) {
      return { primary: [MuscleGroup.lats], secondary: [MuscleGroup.rearDelts, MuscleGroup.traps, MuscleGroup.biceps, MuscleGroup.forearms] };
    }
    if (normalized.includes("shrug")) return { primary: [MuscleGroup.traps], secondary: [] };

    if (normalized.includes("squat") || normalized.includes("lunge")) return { primary: [MuscleGroup.quads, MuscleGroup.glutes], secondary: [MuscleGroup.adductors, MuscleGroup.hamstrings] };
    if (normalized.includes("leg press")) return { primary: [MuscleGroup.quads, MuscleGroup.glutes], secondary: [MuscleGroup.adductors] };
    if (normalized.includes("deadlift")) {
      if (normalized.includes("romanian") || normalized.includes("stiff leg") || normalized.includes("rdl")) return { primary: [MuscleGroup.hamstrings, MuscleGroup.glutes], secondary: [MuscleGroup.lowerBack] };
      return { primary: [MuscleGroup.hamstrings, MuscleGroup.glutes, MuscleGroup.lowerBack], secondary: [MuscleGroup.traps, MuscleGroup.forearms] };
    }
    if (normalized.includes("leg extension")) return { primary: [MuscleGroup.quads], secondary: [] };
    if (normalized.includes("hamstring") || normalized.includes("leg curl")) return { primary: [MuscleGroup.hamstrings], secondary: [] };
    if (normalized.includes("calf")) return { primary: [MuscleGroup.calves], secondary: [] };
    if (normalized.includes("adductor")) return { primary: [MuscleGroup.adductors], secondary: [] };
    if (normalized.includes("abductor")) return { primary: [MuscleGroup.glutes], secondary: [] };
    if (normalized.includes("crunch") || normalized.includes("sit up") || normalized.includes("plank") || normalized.includes("leg raise")) return { primary: [MuscleGroup.abs], secondary: [] };

    return { primary: [], secondary: [] };
  }
};

export const WorkoutIntensityCalculator = {
  computeIntensity(workout: WorkoutPost): Record<string, number> {
    const totals: Partial<Record<MuscleGroup, number>> = {};
    const exercises = workout.exercises || [];

    for (const exercise of exercises) {
      const mapping = MuscleMapper.getMuscles(exercise.name);
      const { primary, secondary } = mapping;

      if (primary.length === 0 && secondary.length === 0) continue;

      let volume = 0;
      if (exercise.sets && exercise.sets.length > 0) {
        for (const set of exercise.sets) {
          const reps = set.reps || 0;
          const weight = set.weight || 0;
          const effectiveWeight = weight > 0 ? weight : 1.0;
          volume += reps * effectiveWeight;
        }
      } else if (exercise.duration_seconds) {
        volume += exercise.duration_seconds;
      } else if (exercise.poses) {
        for (const pose of exercise.poses) {
          volume += (pose.hold_duration_seconds || 0) + (pose.repetitions || 0) * 5.0;
        }
      }

      for (const m of primary) {
        totals[m] = (totals[m] || 0) + volume * 1.0;
      }
      for (const m of secondary) {
        totals[m] = (totals[m] || 0) + volume * 0.5;
      }
    }

    const values = Object.values(totals) as number[];
    const maxVal = values.length > 0 ? Math.max(...values) : 0;

    if (maxVal === 0) return {};

    const normalized: Record<string, number> = {};
    for (const m in totals) {
      normalized[m] = Math.min(1.0, (totals[m as MuscleGroup] || 0) / maxVal);
    }

    return normalized;
  }
};
