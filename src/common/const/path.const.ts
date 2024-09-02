import { join } from 'path';

//서버 프로젝트 루트 폴더
export const PROJECT_ROOT_PATH = process.cwd();
//외부에서 접근 가능한 파일들을 모아둔 폴더 이름
export const PUBLIC_FOLDER_NAME = 'public';

export const ASSIGNMENT_FOLDER_NAME = 'images';

export const VIDEO_FOLDER_NAME = 'video';

export const TEMP_FOLDER_NAME = 'temp';

export const PUBLIC_FOLDER_PATH = join(PROJECT_ROOT_PATH, PUBLIC_FOLDER_NAME);

export const ASSIGNMENT_PATH = join(PUBLIC_FOLDER_NAME, ASSIGNMENT_FOLDER_NAME);

// 임시 파일 저장할 폴더
export const TEMP_PATH = join(PUBLIC_FOLDER_NAME, TEMP_FOLDER_NAME);
