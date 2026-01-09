/**
 * Song Detail Schema Builder
 * 歌曲详情页面
 */

import { Song } from '@/types/Song';
import { SchemaNode } from '@/schemas/types';
import { page, container, card, descriptions } from '@/schemas/core/base';

/**
 * Build song detail schema
 */
export function buildSongDetailSchema(song: Song): SchemaNode {
  return page(
    { title: `歌曲 ${song.songId} 详情` },
    [
      container([
        card({ header: '歌曲信息' }, [
          descriptions([
            { label: '歌曲ID', value: song.songId },
            { label: '歌曲名', value: song.musicTitle[0] || '未知' },
            { label: '乐队ID', value: song.bandId }
          ], { column: 1, border: true })
        ])
      ])
    ]
  );
}
