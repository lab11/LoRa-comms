%% *************************************
%% Samuel Rohrer
%% August 18, 2016
%% *************************************

data = csvread('microjoule_bit_km_data.csv', 1, 0);

%% scatter plot
figure
hold on
scatter3(data(:,1), data(:,2), data(:,3),100,'filled')
xlabel('Nominal Rb (bits per second)')
ylabel('Transmit Power (mA)')
zlabel('uJoules per bit per km')
grid on
view(23,25)
title('full data plot')

%% plot only the interesting part in more detail
figure
scatter3(data(:,1), data(:,2), data(:,3),100,'filled')
xlabel('Nominal Rb (bits per second)')
ylabel('Transmit Power (mA)')
zlabel('uJoules per bit per km')
view(23,25)
title('less than 10k bps plot')
xlim([0 10000])

%% plot only the most interesting part in more detail
figure
scatter3(data(:,1), data(:,2), data(:,3),100,'filled')
xlabel('Nominal Rb (bits per second)')
ylabel('Transmit Power (mA)')
zlabel('uJoules per bit per km')
view(23,25)
title('less than 80 uJ/bit/km less than 10k bps plot')
zlim([0 80])
xlim([0 10000])
