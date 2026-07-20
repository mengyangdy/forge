export const HTTP_METHOD_OPTIONS = [
  { label: "GET", value: "GET" },
  { label: "POST", value: "POST" },
  { label: "PUT", value: "PUT" },
  { label: "DELETE", value: "DELETE" },
];

export const STATUS_CODE_OPTIONS = [
  { label: "200 (成功)", value: 200 },
  { label: "400 (请求参数错误)", value: 400 },
  { label: "401 (未授权/过期)", value: 401 },
  { label: "403 (拒绝访问)", value: 403 },
  { label: "404 (未找到资源)", value: 404 },
  { label: "500 (服务器错误)", value: 500 },
];
