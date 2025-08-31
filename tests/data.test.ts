import { describe, it, expect } from 'vitest'
import { 
  searchSchool, 
  searchSchoolAreas, 
  searchTownAreas,
  getAllTowns,
  getAllSchools 
} from '../src/data'

describe('学校区域検索機能', () => {
  describe('住所から学校を検索', () => {
    it('基本的な住所検索が正常に動作する', () => {
      const result = searchSchool('中央区', '天神', '1丁目～5丁目')
      expect(result).toBeDefined()
      expect(result?.elementary).toBe('舞鶴小')
      expect(result?.middle).toBe('舞鶴中')
    })

    it('存在しない住所の場合はnullを返す', () => {
      const result = searchSchool('存在しない区', '存在しない町', '1丁目')
      expect(result).toBeNull()
    })

    it('区が存在するが町が存在しない場合はnullを返す', () => {
      const result = searchSchool('中央区', '存在しない町', '1丁目')
      expect(result).toBeNull()
    })
  })

  describe('新規追加データのテスト', () => {
    it('香椎団地の検索が正常に動作する', () => {
      const result = searchSchool('東区', '香椎団地', '全域')
      expect(result).toBeDefined()
      expect(result?.elementary).toBe('千早小')
      expect(result?.middle).toBe('香椎第１中')
      expect(result?.highSchoolDistrict).toBe('第４学区')
    })

    it('香椎浜1丁目1番の検索が正常に動作する', () => {
      const result = searchSchool('東区', '香椎浜', '1丁目1番、3番～5番')
      expect(result).toBeDefined()
      expect(result?.elementary).toBe('千早西小')
      expect(result?.middle).toBe('香椎第１中')
      expect(result?.highSchoolDistrict).toBe('第４学区')
    })

    it('東公園3番(7号)、4番～8番の検索が正常に動作する', () => {
      const result = searchSchool('博多区', '東公園', '3番(7号)、4番～8番')
      expect(result).toBeDefined()
      expect(result?.elementary).toBe('千代小')
      expect(result?.middle).toBe('千代中')
      expect(result?.highSchoolDistrict).toBe('第４学区')
    })
  })

  describe('学校名から検索', () => {
    it('千早小の検索で香椎団地が含まれる', () => {
      const result = searchSchoolAreas('千早小')
      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBeGreaterThan(0)
      
      const kashiiDanchi = result.find(area => area.town === '香椎団地')
      expect(kashiiDanchi).toBeDefined()
      expect(kashiiDanchi?.elementary).toBe('千早小')
      expect(kashiiDanchi?.middle).toBe('香椎第１中')
    })

    it('千早西小の検索で香椎浜が含まれる', () => {
      const result = searchSchoolAreas('千早西小')
      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
      
      const kashiihama = result.find(area => area.town === '香椎浜')
      expect(kashiihama).toBeDefined()
      expect(kashiihama?.elementary).toBe('千早西小')
    })

    it('千代小の検索で東公園が含まれる', () => {
      const result = searchSchoolAreas('千代小')
      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
      
      const higashiKoen = result.find(area => area.town === '東公園')
      expect(higashiKoen).toBeDefined()
      expect(higashiKoen?.elementary).toBe('千代小')
      expect(higashiKoen?.middle).toBe('千代中')
    })

    it('存在しない学校名の場合は空配列を返す', () => {
      const result = searchSchoolAreas('存在しない小学校')
      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBe(0)
    })
  })

  describe('町名から住所一覧を検索', () => {
    it('天神の検索が正常に動作する', () => {
      const result = searchTownAreas('中央区', '天神')
      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBeGreaterThan(0)
      
      const area = result[0]
      expect(area.ward).toBe('中央区')
      expect(area.town).toBe('天神')
      expect(area.elementary).toBe('舞鶴小')
      expect(area.middle).toBe('舞鶴中')
    })

    it('香椎団地の検索が正常に動作する', () => {
      const result = searchTownAreas('東区', '香椎団地')
      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBe(1)
      
      const area = result[0]
      expect(area.ward).toBe('東区')
      expect(area.town).toBe('香椎団地')
      expect(area.elementary).toBe('千早小')
      expect(area.middle).toBe('香椎第１中')
    })
  })

  describe('データ一覧取得機能', () => {
    it('すべての町名を取得できる', () => {
      const towns = getAllTowns()
      expect(towns).toBeDefined()
      expect(Array.isArray(towns)).toBe(true)
      expect(towns.length).toBeGreaterThan(100)
      
      // 新規追加した町名が含まれているかチェック
      const kashiiDanchi = towns.find(town => town.town === '香椎団地' && town.ward === '東区')
      expect(kashiiDanchi).toBeDefined()
    })

    it('すべての学校名を取得できる', () => {
      const schools = getAllSchools()
      expect(schools).toBeDefined()
      expect(Array.isArray(schools)).toBe(true)
      expect(schools.length).toBeGreaterThan(100)
      
      // 小学校と中学校の両方が含まれているかチェック
      const elementary = schools.find(school => school.type === 'elementary')
      const middle = schools.find(school => school.type === 'middle')
      expect(elementary).toBeDefined()
      expect(middle).toBeDefined()
    })
  })
})

describe('データ整合性テスト', () => {
  it('すべての区域データに必要な属性が含まれている', () => {
    const towns = getAllTowns()
    
    towns.forEach(town => {
      expect(town.ward).toBeDefined()
      expect(town.ward).not.toBe('')
      expect(town.town).toBeDefined()
      expect(town.town).not.toBe('')
    })
  })

  it('すべての学校データに必要な属性が含まれている', () => {
    const schools = getAllSchools()
    
    schools.forEach(school => {
      expect(school.name).toBeDefined()
      expect(school.name).not.toBe('')
      expect(school.type).toBeDefined()
      expect(['elementary', 'middle']).toContain(school.type)
    })
  })

  it('学校名に重複がない', () => {
    const schools = getAllSchools()
    const schoolNames = schools.map(school => school.name)
    const uniqueNames = new Set(schoolNames)
    
    expect(schoolNames.length).toBe(uniqueNames.size)
  })

  it('基本的な住所データが存在する', () => {
    // 各区の代表的な住所が検索できるかテスト
    const testCases = [
      { ward: '中央区', town: '天神', chome: '1丁目～5丁目' },
      { ward: '博多区', town: '住吉', chome: '1丁目～5丁目' },
      { ward: '東区', town: '香椎団地', chome: '全域' },
      { ward: '南区', town: '大橋', chome: '1丁目1番～8番、13番～19番、20番(1号～3号、21号～28号)' },
      { ward: '西区', town: '愛宕', chome: '1丁目～4丁目' },
      { ward: '早良区', town: '西新', chome: '1丁目～4丁目、6丁目、7丁目' },
      { ward: '城南区', town: '荒江団地', chome: '全域' }
    ]

    testCases.forEach(({ ward, town, chome }) => {
      const result = searchSchool(ward, town, chome)
      expect(result).toBeDefined()
      expect(result?.elementary).toBeDefined()
      expect(result?.middle).toBeDefined()
    })
  })
})
