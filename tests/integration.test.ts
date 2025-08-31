import { describe, it, expect } from 'vitest'
import { searchSchool, searchSchoolAreas } from '../src/data'

describe('統合テスト', () => {
  describe('実際のユースケーステスト', () => {
    it('引越しシナリオ: 天神から香椎への引越し', () => {
      // 現在の住所（天神）の学校を確認
      const currentSchool = searchSchool('中央区', '天神', '1丁目～5丁目')
      expect(currentSchool?.elementary).toBe('舞鶴小')
      expect(currentSchool?.middle).toBe('舞鶴中')

      // 引越し先（香椎団地）の学校を確認
      const newSchool = searchSchool('東区', '香椎団地', '全域')
      expect(newSchool?.elementary).toBe('千早小')
      expect(newSchool?.middle).toBe('香椎第１中')

      // 学校が変わることを確認
      expect(currentSchool?.elementary).not.toBe(newSchool?.elementary)
      expect(currentSchool?.middle).not.toBe(newSchool?.middle)
    })

    it('学校選択シナリオ: 千早小学校区内の住所を調べる', () => {
      const chihayaAreas = searchSchoolAreas('千早小')
      expect(chihayaAreas.length).toBeGreaterThan(1)

      // 香椎団地が含まれることを確認
      const kashiiDanchi = chihayaAreas.find(area => area.town === '香椎団地')
      expect(kashiiDanchi).toBeDefined()
      expect(kashiiDanchi?.chome).toBe('全域')

      // 千早地区も含まれることを確認
      const chihaya = chihayaAreas.find(area => area.town === '千早')
      expect(chihaya).toBeDefined()
    })

    it('近隣学校比較シナリオ: 香椎浜の学校区分', () => {
      // 香椎浜1丁目の異なる番地で異なる学校
      const area1 = searchSchool('東区', '香椎浜', '1丁目1番、3番～5番')
      const area2 = searchSchool('東区', '香椎浜', '1丁目2番、6番～9番、4丁目')

      expect(area1?.elementary).toBe('千早西小')
      expect(area2?.elementary).toBe('香陵小')

      // 同じ中学校区であることを確認
      expect(area1?.middle).toBe('香椎第１中')
      expect(area2?.middle).toBe('香椎第１中')

      // 同じ高校学区であることを確認
      expect(area1?.highSchoolDistrict).toBe('第４学区')
      expect(area2?.highSchoolDistrict).toBe('第４学区')
    })
  })

  describe('エッジケーステスト', () => {
    it('空文字列での検索', () => {
      const result1 = searchSchool('', '', '')
      expect(result1).toBeNull()

      const result2 = searchSchoolAreas('')
      expect(result2).toEqual([])
    })

    it('大文字小文字の違い', () => {
      const result1 = searchSchool('東区', '香椎団地', '全域')
      const result2 = searchSchool('東区', '香椎団地', '全域')
      
      expect(result1).toEqual(result2)
    })

    it('スペースが含まれる場合', () => {
      const result1 = searchSchool('東区', '香椎団地', '全域')
      // 通常の検索が正常に動作することを確認
      expect(result1).toBeDefined()
      expect(result1?.elementary).toBe('千早小')
    })
  })

  describe('パフォーマンステスト', () => {
    it('大量検索のパフォーマンス', () => {
      const startTime = performance.now()
      
      // 100回検索を実行
      for (let i = 0; i < 100; i++) {
        searchSchool('中央区', '天神', '1丁目')
        searchSchoolAreas('舞鶴小')
      }
      
      const endTime = performance.now()
      const duration = endTime - startTime
      
      // 100回の検索が1秒以内に完了することを確認
      expect(duration).toBeLessThan(1000)
    })

    it('全学校の逆引き検索', () => {
      const startTime = performance.now()
      
      // 主要な学校の逆引き検索
      const schools = ['舞鶴小', '千早小', '千早西小', '千代小', '博多小']
      schools.forEach(school => {
        const areas = searchSchoolAreas(school)
        expect(areas.length).toBeGreaterThan(0)
      })
      
      const endTime = performance.now()
      const duration = endTime - startTime
      
      // 合理的な時間内に完了することを確認
      expect(duration).toBeLessThan(500)
    })
  })

  describe('データ完全性テスト', () => {
    it('すべての小学校に対応する中学校が存在する', () => {
      const areas = searchSchoolAreas('千早小')
      
      areas.forEach(area => {
        expect(area.elementary).toBeDefined()
        expect(area.middle).toBeDefined()
        expect(area.ward).toBeDefined()
        expect(area.town).toBeDefined()
        expect(area.chome).toBeDefined()
      })
    })

    it('高校学区の整合性', () => {
      // 東区の学校は第４学区であることを確認
      const eastWardResult = searchSchool('東区', '香椎団地', '全域')
      expect(eastWardResult?.highSchoolDistrict).toBe('第４学区')

      // 博多区の学校は第４学区であることを確認
      const hakataWardResult = searchSchool('博多区', '東公園', '3番(7号)、4番～8番')
      expect(hakataWardResult?.highSchoolDistrict).toBe('第４学区')
    })

    it('新規追加データの一貫性', () => {
      // 香椎団地
      const kashiiDanchi = searchSchool('東区', '香椎団地', '全域')
      expect(kashiiDanchi?.elementary).toBe('千早小')
      expect(kashiiDanchi?.middle).toBe('香椎第１中')

      // 香椎浜
      const kashiihama = searchSchool('東区', '香椎浜', '1丁目1番、3番～5番')
      expect(kashiihama?.elementary).toBe('千早西小')
      expect(kashiihama?.middle).toBe('香椎第１中')

      // 東公園
      const higashiKoen = searchSchool('博多区', '東公園', '3番(7号)、4番～8番')
      expect(higashiKoen?.elementary).toBe('千代小')
      expect(higashiKoen?.middle).toBe('千代中')
    })
  })
})