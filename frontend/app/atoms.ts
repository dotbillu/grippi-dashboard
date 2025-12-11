import { atom } from 'jotai';

export interface Campaign {
  id: number;
  name: string;
  status: "Active" | "Paused";
  clicks: number;
  cost: number;
  impressions: number;
  color: string;
}

export const campaignsAtom = atom<Campaign[]>([]);
export const darkModeAtom = atom<boolean>(false);
export const modalOpenAtom = atom<boolean>(false);
export const loadingAtom = atom<boolean>(true);
