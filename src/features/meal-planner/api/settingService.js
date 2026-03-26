const SETTING_KEY = 'mp_app_settings';

export const settingService = {
  getSettings: () => {
    const data = localStorage.getItem(SETTING_KEY);
    return data ? JSON.parse(data) : {
      categories: "주식, 국, 메인반찬, 밑반찬",
      schedule: { 0: 0, 1: 3, 2: 3, 3: 3, 4: 3, 5: 3, 6: 2 }
    };
  },
  saveSettings: (settings) => {
    localStorage.setItem(SETTING_KEY, JSON.stringify(settings));
  }
};