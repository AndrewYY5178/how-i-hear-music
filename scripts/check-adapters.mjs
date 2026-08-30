const expectTracks = (name, tracks) => {
  if (!Array.isArray(tracks) || !tracks.length || !tracks.every((track) => String(track.title || track.songname || track.name || '').trim())) throw new Error(`${name}: upstream playlist shape is no longer readable`);
  console.log(`${name}: public metadata endpoint healthy (${tracks.length} tracks)`);
};

const qqParams = new URLSearchParams({ type: '1', json: '1', utf8: '1', onlysong: '0', disstid: '8672698451', format: 'json', g_tk: '5381', loginUin: '0', hostUin: '0', inCharset: 'utf8', outCharset: 'utf-8', notice: '0', platform: 'yqq.json', needNewCode: '0' });
const qq = await fetch('https://c.y.qq.com/qzone-music/fcg-bin/fcg_ucc_getcdinfo_byids_cp.fcg?' + qqParams, { headers: { 'User-Agent': 'How-I-Hear-Music/0.1 adapter smoke check', Referer: 'https://y.qq.com/' }, signal: AbortSignal.timeout(12_000) });
if (!qq.ok) throw new Error(`QQ Music: upstream returned ${qq.status}`);
expectTracks('QQ Music', (await qq.json()).cdlist?.[0]?.songlist);

const netease = await fetch('https://music.163.com/api/playlist/detail?id=3778678', { headers: { 'User-Agent': 'How-I-Hear-Music/0.1 adapter smoke check', Referer: 'https://music.163.com/' }, signal: AbortSignal.timeout(12_000) });
if (!netease.ok) throw new Error(`NetEase: upstream returned ${netease.status}`);
expectTracks('NetEase', (await netease.json()).result?.tracks);

const qqAlbum = await fetch('https://c.y.qq.com/v8/fcg-bin/fcg_v8_album_info_cp.fcg?albummid=000hBflm2T62Ur&format=json&platform=yqq.json&needNewCode=0', { headers: { 'User-Agent': 'How-I-Hear-Music/0.1 adapter smoke check', Referer: 'https://y.qq.com/' }, signal: AbortSignal.timeout(12_000) });
if (!qqAlbum.ok) throw new Error(`QQ Music album: upstream returned ${qqAlbum.status}`);
const qqAlbumData = (await qqAlbum.json()).data;
expectTracks('QQ Music album', qqAlbumData?.list);
if (!qqAlbumData?.list?.every((track, index) => Number(track.belongCD) === index + 1)) throw new Error('QQ Music album: official track order is no longer readable');
