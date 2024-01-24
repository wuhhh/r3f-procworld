import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { Vector3 } from "three";

export default create(
	subscribeWithSelector(
		(set, get) => ({
			// Traveller
			keysDown: {
				w: false,
				a: false,
				s: false,
				d: false,
			},
			setKeyDown: (key, value) => set((state) => ({ keysDown: { ...state.keysDown, [key]: value } })),
			pitchInertia: 0,
			setPitchInertia: (value) => set((state) => ({ pitchInertia: value })),
			rollInertia: 0,
			setRollInertia: (value) => set((state) => ({ rollInertia: value })),
			yawInertia: 0,
			setYawInertia: (value) => set((state) => ({ yawInertia: value })),
			tPos: new Vector3(),
			setTPos: (value) => set((state) => ({ tPos: value })),
		})
	)
);