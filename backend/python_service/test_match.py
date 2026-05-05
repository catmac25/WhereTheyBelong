import traceback
from matchalgo import match_private_features
try:
    res = match_private_features('ab03dc94-ba4c-4144-b9f9-32ee7986de96')
    print("SUCCESS", res)
except Exception as e:
    traceback.print_exc()
