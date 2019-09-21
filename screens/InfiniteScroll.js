import React from 'react';
import { ActivityIndicator, Dimensions, FlatList, SafeAreaView, StyleSheet, Text, View, Button, ScrollView } from 'react-native';
import Firebase, { db } from '../config/Firebase';

const { height, width } = Dimensions.get('window');

class InfiniteScroll extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            documentData: [],
            limit: 10,
            lastVisible: null,
            loading: false,
            refreshing: false,
            page: 1
        }
    }

    componentDidMount = () => {
        try {
            this.retrieveData();
        } catch (e) {
            console.log(e);
        }
    }

    retrieveData = async () => {
        try {
            this.setState({ loading: true });
            console.log('Retrieving Data');

            let initialQuery = await db.collection('users')
                // .where('id', '<=', this.state.max)
                .orderBy('created_at', 'desc')
                .limit(this.state.limit);

            let documentSnapshots = await initialQuery.get();

            let documentData = documentSnapshots.docs.map(document => document.data());

            let lastVisible = documentData[documentData.length - 1].created_at;

            this.setState({
                documentData: documentData,
                lastVisible: lastVisible,
                loading: false
            });

        } catch (e) {
            console.log(e);
        }
    }

    retrieveMore = async () => {

        if (this.state.page >= 5) {
            alert("max");
            return null;
        }

        try {
            this.setState({ refreshing: true });
            console.log('Retrieving additional Data');
            console.log(this.state.lastVisible);
            let additionalQuery = await db.collection('users')
                // .where('id', '<=', this.state.max)
                .orderBy('created_at', 'desc')
                .startAfter(this.state.lastVisible)
                .limit(this.state.limit);

            let documentSnapshots = await additionalQuery.get();

            let documentData = documentSnapshots.docs.map(document => document.data());

            let lastVisible = documentData[documentData.length - 1].created_at;

            if (this.state.page > 5) {
                alert("max");
                this.setState({
                    refreshing: false
                });
            } else {

                this.setState({
                    documentData: [...this.state.documentData, ...documentData],
                    lastVisible: lastVisible,
                    refreshing: false,
                    page: this.state.page + 1,
                });
            }

            console.log("page=" + this.state.page)

        } catch (e) {
            this.setState({ refreshing: false });
            console.log(e);
        }

    }

    renderHeader = () => {
        try {
            return (
                <View style={{ height: 40, justifyContent: 'center', alignItems: 'center', backgroundColor: "#eee" }}>
                    <Text style={{ fontSize: 18 }}>Items</Text>
                </View>

            );
        } catch (e) {
            console.log(e);
        }
    }

    renderFooter = () => {
        try {
            if (this.state.loading || this.state.refreshing) {
                return (
                    // <ActivityIndicator style />
                    <View style={{ height: 60, justifyContent: 'center', alignItems: 'center', backgroundColor: "#eee" }}>
                        <ActivityIndicator size="large" />
                    </View>
                );
            } else {
                return null;
            }
        } catch (e) {
            console.log(e);
        }
    }

    render() {
        return (
            <SafeAreaView style={styles.container}>
                <FlatList
                    data={this.state.documentData}
                    renderItem={({ item }) => (
                        <View style={styles.itemContainer}>
                            <Text>(ID:{item.id}) {item.first_name} {item.last_name}</Text>
                            <Button
                                title="push"
                                onPress={() => alert(item.id)}
                            />
                        </View>
                    )}
                    keyExtractor={(item, index) => String(index)}
                    ListHeaderComponent={this.renderHeader}
                    ListFooterComponent={this.renderFooter}
                    onEndReached={this.retrieveMore}
                    onEndReachedThreshold={0}
                    refreshing={this.state.refreshing}
                    onRefresh={() => {
                        this.retrieveData();
                        this.setState({
                            page: 0
                        })
                    }}
                />
            </SafeAreaView>
        );
    }
}

export default InfiniteScroll

// Styles
const styles = StyleSheet.create({
    container: {
        height: height,
        width: width,
    },
    headerText: {
        fontFamily: 'System',
        fontSize: 36,
        fontWeight: '600',
        color: '#000',
        marginLeft: 12,
        marginBottom: 12,
    },
    itemContainer: {
        height: 80,
        width: width,
        borderWidth: .2,
        borderColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        fontFamily: 'System',
        fontSize: 16,
        fontWeight: '400',
        color: '#000',
    },
});