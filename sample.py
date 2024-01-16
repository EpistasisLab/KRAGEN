import pandas as pd

df = pd.read_csv("test.csv")

unique_types = df["source_label"].unique()

for row_type in unique_types:
    x = df[df["source_label"]==row_type].head(300)
    x.to_csv("my_test.csv", mode='a', header=True, index=False)
