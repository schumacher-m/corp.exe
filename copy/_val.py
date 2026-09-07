import re,json
from pathlib import Path
root=Path("/workspace/corp-html/copy")
for name in ["kyle-pr.md","kyle-space-war.md","kyle-slack.md"]:
  t=(root/name).read_text(); blocks=re.findall(r"```json\n(.*?)```",t,re.S)
  for i,b in enumerate(blocks): json.loads(b)
  print(name,"ok",len(blocks),(root/name).stat().st_size)
