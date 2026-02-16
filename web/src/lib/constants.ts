import { SystemType, FontFamily } from "./types";

export interface SystemInfo {
  value: SystemType;
  label: string;
  description: string;
}

export const SYSTEMS: SystemInfo[] = [
  { value: "name_couplet", label: "姓名春联", description: "将您的名字巧妙藏入春联" },
  { value: "family_couplet", label: "亲属春联", description: "为两个人定制专属春联" },
  { value: "blessing", label: "祝福语", description: "AI生成个性化新年祝福" },
  { value: "kinship", label: "亲戚关系", description: "算算七大姑八大姨怎么叫" },
  { value: "riddle", label: "灯谜", description: "AI出题，猜猜看" },
];

export const FAMILY_RELATIONSHIPS = [
  "情侣", "夫妻", "父子", "父女", "母子", "母女",
  "兄弟", "姐妹", "兄妹", "姐弟", "朋友", "同事",
];

export const BLESSING_RELATIONSHIPS = [
  "领导", "下属", "父亲", "母亲", "老师", "同事",
  "朋友", "长辈", "晚辈", "恋人", "客户", "同学",
];

export const KINSHIP_CHIPS = [
  "爸爸", "妈妈", "哥哥", "弟弟", "姐姐", "妹妹", "儿子", "女儿",
  "爷爷", "奶奶", "外公", "外婆", "叔叔", "阿姨", "舅舅", "姑姑",
];

export const FONTS: { value: FontFamily; label: string }[] = [
  { value: "default", label: "系统楷体" },
  { value: "zhengqing", label: "正卿南北朝公牍松体" },
  { value: "liujianmaocao", label: "刘建毛草" },
  { value: "mashanzheng", label: "马善政楷书" },
  { value: "zhimangxing", label: "志莽行书" },
];
